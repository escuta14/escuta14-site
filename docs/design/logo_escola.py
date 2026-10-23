# Prepara o logo do colégio para o site, a partir do arquivo horizontal que a Mariane mandou
# (docs/referencias/logo-colegio-horizontal.png, 1774 x 887, fundo transparente).
#
# Uso: python -P -E logo_escola.py
#
# O que faz, sem mexer no original:
# 1. Limpa: o arquivo veio com a opacidade das partes cheias em 250 de 255 e uma névoa quase
#    invisível no fundo; aqui as partes cheias voltam a 255, a névoa some e os pixels
#    transparentes perdem a cor escondida (que aparece como franja colorida em fundo preto).
# 2. Grava o logo completo (figuras + "14 DE DEZEMBRO / COLÉGIO ESTADUAL"):
#    logo-colegio-horizontal-limpo.png (tamanho cheio) e logo-colegio-web.webp (para a página).
# 3. Grava só as quatro figuras, separadas das letras pela cor e pela posição:
#    logo-figuras-hd.png (tamanho cheio, entrada do esculpir.py) e logo-figuras-web.webp.
import pathlib

import numpy as np
from PIL import Image

PASTA = pathlib.Path(__file__).resolve().parent.parent / 'referencias'
ORIGINAL = PASTA / 'logo-colegio-horizontal.png'

# Cores medidas no próprio logo (mediana dos pixels cheios), 22/10/2026.
CORES = {
    'azul': (0x01, 0x4B, 0xB5), 'cinza': (0x53, 0x54, 0x59), 'laranja': (0xF7, 0x43, 0x01),
    'amarelo': (0xCD, 0xCB, 0x02), 'verde': (0x03, 0x70, 0x32), 'cinza-texto': (0x47, 0x49, 0x4B),
}
FIGURAS = ('azul', 'cinza', 'laranja', 'amarelo')


def recortar(im, margem):
    caixa = im.getchannel('A').point(lambda v: 255 if v > 0 else 0).getbbox()
    x0, y0, x1, y1 = caixa
    return im.crop((max(0, x0 - margem), max(0, y0 - margem), min(im.width, x1 + margem), min(im.height, y1 + margem)))


def web(im, largura, destino):
    altura = round(im.height * largura / im.width)
    im.resize((largura, altura), Image.LANCZOS).save(destino, 'WEBP', quality=80, method=6)
    return largura, altura


a = np.asarray(Image.open(ORIGINAL).convert('RGBA')).astype(np.float32)
rgb, alfa = a[..., :3], a[..., 3]
alfa = np.clip(alfa * 255 / 250, 0, 255)
alfa[alfa < 20] = 0  # a névoa do fundo
rgb[alfa == 0] = 0

limpo = Image.fromarray(np.dstack([rgb, alfa]).astype(np.uint8), 'RGBA')
limpo = recortar(limpo, 8)
limpo.save(PASTA / 'logo-colegio-horizontal-limpo.png', optimize=True)
print('logo completo', limpo.size, '-> web', web(limpo, 480, PASTA / 'logo-colegio-web.webp'))

# Figuras: cada pixel vai para a cor do logo mais próxima; ficam as quatro cores das figuras.
# O cinza das figuras e o cinza de "COLÉGIO ESTADUAL" são quase iguais, então o texto cinza é
# separado pela posição (fica à direita e abaixo das figuras).
nomes = list(CORES)
paleta = np.array([CORES[n] for n in nomes], dtype=np.float32)
L = np.asarray(limpo).astype(np.float32)
mais_perto = ((L[..., None, :3] - paleta[None, None]) ** 2).sum(-1).argmin(-1)
yy, xx = np.mgrid[0:L.shape[0], 0:L.shape[1]]
caixa_texto_cinza = (xx >= 560) & (yy >= 420)  # coordenadas já no recorte (8 px de margem)
cinzas = np.isin(mais_perto, [nomes.index('cinza'), nomes.index('cinza-texto')])
eh_figura = np.isin(mais_perto, [nomes.index(n) for n in FIGURAS if n != 'cinza']) | (cinzas & ~caixa_texto_cinza)
so_figuras = L.copy()
so_figuras[~eh_figura] = 0
figuras = recortar(Image.fromarray(so_figuras.astype(np.uint8), 'RGBA'), 6)
figuras.save(PASTA / 'logo-figuras-hd.png', optimize=True)
print('figuras', figuras.size, '-> web', web(figuras, 420, PASTA / 'logo-figuras-web.webp'))
