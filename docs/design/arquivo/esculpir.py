# Transforma as figuras planas do logo numa "escultura" 3D inflada e brilhante (acabamento
# Escultura da página de designs). Não usa programa de 3D: calcula uma "altura" para cada ponto
# (mais alta no meio de cada figura, como uma almofada), tira dela a inclinação da superfície e
# acende com uma luz de cima à esquerda, um reflexo forte e um brilho de borda.
#
# Uso: python -P -E esculpir.py <logo-figuras-hd.png> <saida.webp> <previa.png>
# (a entrada sai do logo_escola.py; a saída usada na página é docs/referencias/logo-figuras-3d.webp)
import sys

import numpy as np
from PIL import Image

entrada, saida, previa = sys.argv[1:4]
ESCALA = 4  # a peça é calculada com as figuras a 212 x ESCALA px de largura; os raios abaixo contam nessa escala
PALETA = np.array([  # cores medidas no logo horizontal (logo_escola.py)
    [0x01, 0x4B, 0xB5],  # azul
    [0x53, 0x54, 0x59],  # cinza
    [0xF7, 0x43, 0x01],  # laranja
    [0xCD, 0xCB, 0x02],  # amarelo
], dtype=np.float32)

img = Image.open(entrada).convert('RGBA')
s = 212 * ESCALA / img.width
img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
M = 12 * ESCALA  # margem para o volume e o brilho não baterem na borda
grande = Image.new('RGBA', (img.width + 2 * M, img.height + 2 * M), (0, 0, 0, 0))
grande.paste(img, (M, M))
W, H = grande.size


def desfoque(arr, sigma):
    """Desfoque gaussiano em ponto flutuante (pela FFT), sem degraus de 8 bits."""
    fy = np.fft.fftfreq(arr.shape[0])[:, None]
    fx = np.fft.rfftfreq(arr.shape[1])[None, :]
    nucleo = np.exp(-2 * (np.pi * sigma) ** 2 * (fx ** 2 + fy ** 2))
    return np.fft.irfft2(np.fft.rfft2(arr) * nucleo, s=arr.shape)


a = np.asarray(grande.getchannel('A'), dtype=np.float32) / 255
mascara = 1 / (1 + np.exp(-(desfoque(a, ESCALA * 0.6) - 0.5) * 16))

# Cor chapada: a cor do logo mais próxima, espalhada para fora para cobrir a borda suave.
rgb = np.asarray(grande.convert('RGB'), dtype=np.float32)
dentro = np.asarray(grande.getchannel('A')) > 128
idx = ((rgb[:, :, None, :] - PALETA[None, None]) ** 2).sum(-1).argmin(-1)
pesos = np.stack([desfoque(((idx == k) & dentro).astype(np.float32), ESCALA * 2) for k in range(4)], -1)
cor = PALETA[pesos.argmax(-1)] / 255

# Altura: soma de desfoques largos = almofada que sobe até o meio de cada peça.
altura = sum(desfoque(mascara, r * ESCALA) for r in (4, 8, 14, 22)) / 4
altura = np.clip(altura, 0, 1) ** 0.6 * mascara
altura = desfoque(altura, ESCALA * 0.7)

gy, gx = np.gradient(altura * 34 * ESCALA)
n = np.dstack([-gx, -gy, np.ones_like(gx)])
n /= np.linalg.norm(n, axis=2, keepdims=True)


def unit(v):
    v = np.array(v, dtype=np.float32)
    return v / np.linalg.norm(v)


luz = unit([-0.5, -0.8, 0.85])
contra = unit([0.75, 0.45, 0.5])
meio = unit(luz + np.array([0, 0, 1.0]))

difusa = np.clip((n * luz).sum(2), 0, 1)
fill = np.clip((n * contra).sum(2), 0, 1)
ndoth = np.clip((n * meio).sum(2), 0, 1)
especular = ndoth ** 120 * 1.1 + ndoth ** 18 * 0.14
borda = (1 - np.clip(n[:, :, 2], 0, 1)) ** 2.5  # brilho de borda (fresnel)
oclusao = 1 - 0.28 * np.clip(desfoque(mascara, 10 * ESCALA) - 0.45 * mascara, 0, 1)

ambiente = np.array([0.93, 0.94, 1.0], dtype=np.float32)  # reflexo do chão lavanda
# Sombra que escurece mantendo a cor (cor ** 1.8): o amarelo não vira verde-oliva.
t = np.clip(0.15 + 0.8 * difusa + 0.12 * fill, 0, 1.15)[..., None] * oclusao[..., None]
escura = cor ** 1.8 * 0.8
col = escura + (cor - escura) * t
col += especular[..., None]
col += borda[..., None] * ambiente * 0.28
col = np.clip(col, 0, 1)

im = Image.fromarray((np.dstack([col, mascara]) * 255 + 0.5).astype(np.uint8), 'RGBA')
im = im.resize((W // 2, H // 2), Image.LANCZOS)
im.save(saida, 'WEBP', quality=86, method=6)
fundo = Image.new('RGBA', im.size, (240, 241, 250, 255))
fundo.alpha_composite(im)
fundo.convert('RGB').save(previa)
print(im.size)
