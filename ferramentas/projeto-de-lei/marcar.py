# Marca como inserido o fim de parágrafo dos parágrafos inteiramente novos, para que
# recusar a alteração no Word apague o parágrafo inteiro em vez de deixar uma linha vazia.
# Uso: python marcar.py entrada.docx saida.docx
import re
import sys
import zipfile
import xml.dom.minidom

entrada, saida = sys.argv[1], sys.argv[2]
z = zipfile.ZipFile(entrada)
x = z.read('word/document.xml').decode('utf-8')
proximo = max(int(i) for i in re.findall(r'w:id="(\d+)"', x)) + 1
marcados = 0


def marcar(m):
    global proximo, marcados
    par = m.group(0)
    conteudo = re.sub(r'^<w:p\b[^>]*>(<w:pPr>.*?</w:pPr>)?', '', par, flags=re.S)[: -len('</w:p>')]
    sobra = re.sub(r'<w:ins\b[^>]*>.*?</w:ins>', '', conteudo, flags=re.S).strip()
    if '<w:ins' not in conteudo or sobra:
        return par
    tag = f'<w:ins w:id="{proximo}" w:author="Proposta ESCUTA 14" w:date="2026-10-22T13:30:00Z"/>'
    proximo += 1
    marcados += 1
    ppr = re.match(r'^<w:p\b[^>]*>(<w:pPr>.*?</w:pPr>)?', par, flags=re.S).group(1)
    if ppr is None:
        return re.sub(r'^(<w:p\b[^>]*>)', lambda a: a.group(1) + f'<w:pPr><w:rPr>{tag}</w:rPr></w:pPr>', par, count=1)
    if '<w:rPr>' in ppr:
        novo = ppr.replace('<w:rPr>', '<w:rPr>' + tag, 1)
    else:
        novo = ppr.replace('</w:pPr>', f'<w:rPr>{tag}</w:rPr></w:pPr>', 1)
    return par.replace(ppr, novo, 1)


x = re.sub(r'<w:p\b[^>]*>.*?</w:p>', marcar, x, flags=re.S)
with zipfile.ZipFile(saida, 'w', zipfile.ZIP_DEFLATED) as out:
    for info in z.infolist():
        if info.is_dir():
            continue
        dados = x.encode('utf-8') if info.filename == 'word/document.xml' else z.read(info.filename)
        if info.filename.endswith(('.xml', '.rels')):
            xml.dom.minidom.parseString(dados)
        out.writestr(info.filename, dados)
print('parágrafos novos marcados:', marcados)
