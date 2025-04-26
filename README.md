# URL Shortener com QR Code

Encurtador de URLs simples feito em Node.js + Express, com geração de QR Code e persistência em SQLite.

## Funcionalidades

- Encurta URLs e gera um código único
- Gera QR Code para qualquer URL (incluindo as encurtadas)
- Mostra QR Code no frontend
- Salva URLs no banco SQLite (persistente)
- Ícone de webhook no favicon

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor:
   ```bash
   node server.js
   ```

3. Acesse no navegador:
   ```
   http://localhost:3000
   ```

## Endpoints

- `POST /shorten`  
  Corpo: `{ "url": "https://exemplo.com" }`  
  Resposta: `{ "shortUrl": "http://localhost:3000/abc1234" }`

- `GET /qrcode?url=...`  
  Retorna o QR code em PNG para a URL informada.

- `GET /:code`  
  Redireciona para a URL original.

## Exemplo de uso com curl

```bash
curl -X POST http://localhost:3000/shorten -H "Content-Type: application/json" -d "{\"url\": \"https://google.com\"}"
curl "http://localhost:3000/qrcode?url=https://google.com" --output qrcode.png
```

## Licença

MIT 