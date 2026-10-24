'use server';
// Ação do servidor que grava uma manifestação (fatia 1.1). Ordem: validar o que chegou →
// conferir o antispam → contar o limite da hora → sortear o protocolo → gravar. Em nenhum
// momento o IP, o navegador ou o protocolo são gravados junto com a manifestação nem vão
// para o log (regras 10 e 15 do CLAUDE.md).
import { headers } from 'next/headers';
import { chaveDaJanela, conferirTurnstile, LIMITES } from '@/lib/antispam';
import { calcularPrazo, dataDoBanco, ehDemonstracao, formatarData } from '@/lib/datas';
import { gerarProtocolo } from '@/lib/protocolo';
import { validarEnvio, type EntradaEnvio } from '@/lib/regras';
import { embaralhar, exigir, exigirSegredoAnonimato } from '@/lib/segredos';
import { bancoDoServidor } from '@/lib/supabase-servidor';

export type ResultadoEnvio = { ok: true; protocolo: string; prazo: string } | { ok: false; erro: string };

const FORA_DO_AR: ResultadoEnvio = { ok: false, erro: 'O ESCUTA 14 está fora do ar agora. Seu texto continua aqui.' };

/** IP de quem enviou, só para o limite da hora. Na Vercel vem nestes cabeçalhos. */
async function ipDaRequisicao(): Promise<string> {
  const h = await headers();
  return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconhecido';
}

export async function enviarManifestacao(entrada: EntradaEnvio): Promise<ResultadoEnvio> {
  const validacao = validarEnvio(entrada ?? {});
  if (!validacao.ok) return validacao;

  // Falha fechada: sem os segredos configurados, ninguém envia.
  let segredoTurnstile: string, segredoAnonimato: string, banco: ReturnType<typeof bancoDoServidor>;
  try {
    segredoTurnstile = exigir('TURNSTILE_SECRET_KEY');
    segredoAnonimato = exigirSegredoAnonimato();
    banco = bancoDoServidor();
  } catch {
    console.error('envio: configuração incompleta no servidor');
    return FORA_DO_AR;
  }

  if (!(await conferirTurnstile(entrada.token, segredoTurnstile))) {
    return { ok: false, erro: 'Não conseguimos confirmar que você é uma pessoa. Tente de novo.' };
  }

  const agora = new Date();
  const chave = chaveDaJanela(embaralhar(await ipDaRequisicao(), segredoAnonimato), 'envio', agora);
  const { data: dentroDoLimite, error: erroLimite } = await banco.rpc('registrar_tentativa', { p_chave: chave, p_maximo: LIMITES.envio });
  if (erroLimite) {
    console.error('envio: falha no limite', erroLimite.code);
    return FORA_DO_AR;
  }
  if (dentroDoLimite !== true) return { ok: false, erro: 'Muitas mensagens deste lugar agora. Tente daqui a pouco.' };

  const protocolo = gerarProtocolo();
  const prazo = calcularPrazo(agora);
  const { error } = await banco.from('manifestacoes').insert({
    ...validacao.dados,
    protocolo_hash: embaralhar(protocolo, segredoAnonimato),
    prazo_em: dataDoBanco(prazo),
    demonstracao: ehDemonstracao(agora, process.env.MOSTRA_INICIO, process.env.MOSTRA_FIM),
  });
  if (error) {
    console.error('envio: falha ao gravar', error.code);
    return FORA_DO_AR;
  }

  return { ok: true, protocolo, prazo: formatarData(prazo) };
}
