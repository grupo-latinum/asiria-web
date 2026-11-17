"""Crea la carpeta de un catálogo nuevo a partir de la plantilla.

Uso (en la terminal, dentro de la carpeta asiria-web):
    python nuevo_catalogo.py panaderia-rosita

Resultado: c/panaderia-rosita/ con index.html, datos.json y la carpeta fotos/.
Luego solo editas datos.json y pones las fotos del cliente en fotos/.
"""
import json
import re
import shutil
import sys
from pathlib import Path

RAIZ = Path(__file__).parent
PLANTILLA = RAIZ / 'c' / 'sabores-del-norte'


def main():
    if len(sys.argv) != 2:
        print('Uso: python nuevo_catalogo.py nombre-del-negocio')
        sys.exit(1)
    nombre = sys.argv[1].strip().lower()
    if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', nombre):
        print('El nombre solo puede tener letras minúsculas sin tilde, números y guiones. Ej.: panaderia-rosita')
        sys.exit(1)
    destino = RAIZ / 'c' / nombre
    if destino.exists():
        print(f'Ya existe {destino}. Elige otro nombre.')
        sys.exit(1)

    (destino / 'fotos').mkdir(parents=True)
    shutil.copy(PLANTILLA / 'index.html', destino / 'index.html')
    datos = {
        'negocio': 'Nombre del negocio',
        'descripcion': 'Qué vende, en una línea',
        'whatsapp': '519XXXXXXXX',
        'color': '#1a2558',
        'moneda': 'S/',
        'logo': '',
        'horario': 'Lun a sáb · 9:00 a 18:00',
        'direccion': 'Chiclayo',
        'entrega': 'Delivery y recojo',
        'demo': False,
        'categorias': [
            {'nombre': 'Categoría 1', 'productos': [
                {'nombre': 'Producto', 'descripcion': 'Descripción corta', 'precio': 10, 'foto': 'fotos/producto.jpg'}
            ]}
        ]
    }
    (destino / 'datos.json').write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Listo: {destino}')
    print('Ahora edita datos.json y copia las fotos del cliente en la carpeta fotos/.')


if __name__ == '__main__':
    main()
