dev:
    npm run dev
build:
    npm run build
cv *FILE:
    npm run test:unit -- --coverage {{FILE}}
host:
    npm run dev -- --host
e2e:
    npm run test:e2e:dev