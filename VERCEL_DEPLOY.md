# Guia de Implantação na Vercel

Para que o projeto funcione corretamente na Vercel, você precisará configurar as variáveis de ambiente no painel do seu projeto.

## Variáveis de Ambiente Necessárias

Acesse: **Project Settings > Environment Variables** e adicione as seguintes chaves:

1.  `VITE_SUPABASE_URL`: A URL do seu projeto Supabase.
2.  `VITE_SUPABASE_ANON_KEY`: A chave anônima (anon key) do seu projeto Supabase.
3.  `GEMINI_API_KEY`: Sua chave de API do Google Gemini (se aplicável).

> [!NOTE]
> O prefixo `VITE_` é importante para que o Vite consiga acessar essas variáveis no lado do cliente.

## Passos para Implantação

1.  Conecte seu repositório GitHub à Vercel.
2.  A Vercel detectará automaticamente que é um projeto Vite.
3.  Configure as variáveis acima.
4.  Clique em **Deploy**.

O arquivo `vercel.json` incluído cuidará do roteamento das páginas (Single Page Application).
