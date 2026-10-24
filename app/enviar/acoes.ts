'use server';
// Ação do servidor que grava uma manifestação (fatia 1.1). Ordem: validar o que chegou →
// conferir o antispam → contar o limite da hora → sortear o protocolo → gravar. Em nenhum
// momento o IP, o navegador ou o protocolo são gravados junto com a manifestação nem vão
// para o log (regras 10 e 15 do CLAUDE.md).
import { conferirTurnstile } from '@/lib/antispam';
import { calcularPrazo, dataDoBanco, ehDemonstracao, formatarData } from '@/lib/datas';
import { gerarProtocolo } from '@/lib/protocolo';
import { validarEnvio, type EntradaEnvio } from '@/lib/regras';
import { embaralhar } from '@/lib/segredos';
import { dentroDoLimite, prepararServidor } from '@/lib/servidor';

export type ResultadoEnvio = { ok: true; protocolo: string; prazo: string } | { ok: false; erro: string };

const FORA_DO_AR: ResultadoEnvio = { ok: false, erro: 'O ESCUTA 14 está fora do ar agora. Seu texto continua aqui.' };

export async function enviarManifestacao(entrada: EntradaEnvio): Promise<ResultadoEnvio> {
  const validacao = validarEnvio(entrada ?? {});
  if (!validacao.ok) return validacao;

  // Falha fechada: sem os segredos configurados, ninguém envia.
  const s = prepararServidor();
  const segredoTurnstile = process.env.TURNSTILE_SECRET_KEY?.trim() || null;
  if (!s || !segredoTurnstile) return FORA_DO_AR;

  if (!(await conferirTurnstile(entrada.token, segredoTurnstile))) {
    return { ok: false, erro: 'Não conseguimos confirmar que você é uma pessoa. Tente de novo.' };
  }
  const limite = await dentroDoLimite(s, 'envio');
  if (limite === null) return FORA_DO_AR;
  if (!limite) return { ok: false, erro: 'Muitas mensagens deste lugar agora. Tente daqui a pouco.' };

  const agora = new Date();
  const protocolo = gerarProtocolo();
  const prazo = calcularPrazo(agora);
  const { error } = await s.banco.from('manifestacoes').insert({
    ...validacao.dados,
    protocolo_hash: embaralhar(protocolo, s.segredoAnonimato),
    prazo_em: dataDoBanco(prazo),
    demonstracao: ehDemonstracao(agora, process.env.MOSTRA_INICIO, process.env.MOSTRA_FIM),
  });
  if (error) {
    console.error('envio: falha ao gravar', error.code);
    return FORA_DO_AR;
  }
  return { ok: true, protocolo, prazo: formatarData(prazo) };
}
