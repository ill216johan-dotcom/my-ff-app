# React + Vite

Этот шаблон предоставляет минимальную настройку для работы React в Vite с HMR и некоторыми правилами ESLint.

В настоящее время доступны два официальных плагина:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) использует [Babel](https://babeljs.io/) (или [oxc](https://oxc.rs) при использовании в [rolldown-vite](https://vite.dev/guide/rolldown)) для Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) использует [SWC](https://swc.rs/) для Fast Refresh

## React Compiler

React Compiler не включен в этот шаблон из-за его влияния на производительность разработки и сборки. Чтобы добавить его, см. [эту документацию](https://react.dev/learn/react-compiler/installation).

## Расширение конфигурации ESLint

Если вы разрабатываете production-приложение, мы рекомендуем использовать TypeScript с включенными правилами линтинга с учетом типов. Ознакомьтесь с [шаблоном TS](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) для получения информации о том, как интегрировать TypeScript и [`typescript-eslint`](https://typescript-eslint.io) в ваш проект.
