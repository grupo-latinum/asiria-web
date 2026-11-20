# Cómo crear el catálogo de un cliente

## 1. Lo que le pides al cliente (cópialo y envíalo por WhatsApp)

> ¡Hola! Para armar tu catálogo necesito:
> 1. **Nombre del negocio** y una frase corta de lo que vendes.
> 2. **Logo** (si tienes) y un **color** de tu marca.
> 3. **Número de WhatsApp** donde quieres recibir los pedidos.
> 4. **Horario**, **dirección** o zona, y si haces **delivery, recojo o ambos**.
> 5. **Tus productos** (hasta 20): nombre, descripción corta y precio, ordenados por categoría (ej.: Entradas, Fondos, Bebidas).
> 6. **Una foto por producto**, de preferencia cuadrada, con buena luz y fondo limpio.
> 7. Un mensaje que diga: *"Autorizo a Asiria a mostrar mi catálogo como ejemplo de su trabajo."*

## 2. Crear la carpeta del cliente

En la terminal, dentro de `asiria-web`:

```
python nuevo_catalogo.py nombre-del-negocio
```

Usa minúsculas, sin tildes y con guiones: `panaderia-rosita`, `estetica-bella`.

## 3. Llenar `datos.json`

Abre `c/nombre-del-negocio/datos.json` y cambia los textos. Reglas:

- Los textos van **entre comillas**: `"Arroz con pato"`.
- Los precios van **sin comillas**: `38` o `12.5`.
- Entre un producto y otro va una **coma**; después del último, no.
- `whatsapp`: con código de país y sin espacios ni `+`: `51958736378`.
- `color`: código de color como `#9a3b12`. Elige uno oscuro para que el texto blanco se lea bien.
- `demo`: `false` para clientes reales.
- `firma`: `true` muestra "Hecho por Asiria" al pie. En el plan Pro, con dominio del cliente, usa `false` para que el catálogo se vea 100 % del cliente.

Si algo queda mal escrito, el catálogo mostrará "No pudimos cargar el catálogo". Revisa comas y comillas.

## 4. Fotos

- Copia las fotos en `c/nombre-del-negocio/fotos/`.
- Nombres simples: `arroz-con-pato.jpg`.
- Pesan menos si las reduces a unos 600 × 600 px.

## 5. Probar y publicar

1. Pruébalo en tu computadora: `python -m http.server 8090` y abre `http://localhost:8090/c/nombre-del-negocio/`.
2. Publica con `git add .`, `git commit` y `git push`. Cloudflare lo pone en línea en uno o dos minutos.
3. El enlace del cliente queda así: `https://asiria.grupolatinum.com/c/nombre-del-negocio/`.
4. Genera su **código QR** con ese enlace (por ejemplo, desde Canva o cualquier generador de QR) y entrégaselo.
