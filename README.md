# Ritual de Beleza

Blog em React e TypeScript sobre cosméticos, cuidados com a pele, maquiagem e autocuidado. Visitantes podem ler os posts e comentar; a editora gerencia os textos e revisa comentários pelo painel.

## Executar

```sh
npm install
npm run dev
```

Para validar a aplicação:

```sh
npm run build
npm run lint
```

## Acesso de demonstração

- E-mail: `editora@ritualdebeleza.blog`
- Senha: `beleza2026`

Posts e comentários ficam no `localStorage` do navegador. Comentários enviados aguardam aprovação no painel. A aplicação usa uma chave de armazenamento própria para os dados do tema de beleza.

## Segurança

Este é um protótipo somente frontend. A credencial de demonstração está no código e o estado local pode ser alterado pelo visitante; o login não deve ser usado em produção. Uma publicação real precisa de backend com autenticação, sessões protegidas, autorização e banco de dados.