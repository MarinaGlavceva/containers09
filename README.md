
# Лабораторная работа: Оптимизация Docker-образов

## Цель работы

Целью этой лабораторной работы было ознакомиться с методами оптимизации Docker-образов и на практике сравнить их эффективность.

## Задание

Мне нужно было выполнить следующие задачи:

- Создать простой сайт и поместить его в папку `site`.
- Собрать несколько Docker-образов с разными стратегиями оптимизации:
  - Удаление неиспользуемых зависимостей и временных файлов.
  - Уменьшение количества слоёв.
  - Использование минимального базового образа.
  - Перепаковка образа.
  - Использование всех методов вместе.
- Сравнить размеры полученных образов и оформить выводы.

---

## Ход работы

### 1 Подготовка сайта

В папке `site` я создала простой сайт, который состоит из трёх файлов:

- `index.html`
- `styles.css`
- `script.js`

Я решила сделать сайт чуть более интересным и добавила интерактивный элемент — кнопку, по нажатию на которую выводится случайное сообщение.

**`index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Fancy Site</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to My Fancy Nginx Site!</h1>
    </header>
    <main>
        <p>This site is running inside a Docker container using Nginx.</p>
        <button id="clickMe">Click Me!</button>
        <div id="output"></div>
    </main>
    <footer>
        <p>&copy; 2025 My Fancy Site</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>
```

**`styles.css`:**

```css
body {
    background: #f0f0f0;
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 20px;
}

header {
    background: #4CAF50;
    color: white;
    padding: 20px 0;
}

main {
    margin-top: 20px;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    margin-top: 20px;
    cursor: pointer;
}

#output {
    margin-top: 20px;
    font-size: 18px;
    color: #333;
}

footer {
    margin-top: 40px;
    font-size: 14px;
    color: #666;
}
```

**`script.js`:**

```js
console.log('Site is working!');

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickMe');
    const output = document.getElementById('output');

    button.addEventListener('click', function() {
        const messages = [
            'You clicked the button!',
            'Docker is awesome 🚀',
            'Nginx is serving this page 📄',
            'Another click, another message 😄',
            'Keep exploring Docker!'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        output.textContent = randomMessage;
    });
});
```

---

### 2️ Базовый образ (mynginx:raw)

Я создала Dockerfile `Dockerfile.raw` с простейшим образом на базе Ubuntu:

```Dockerfile
FROM ubuntu:latest

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y nginx
COPY site /var/www/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Собрала образ:

```bash
docker image build -t mynginx:raw -f Dockerfile.raw .
```

---

### 3️ Удаление неиспользуемых файлов (mynginx:clean)

Создала `Dockerfile.clean`, добавив очистку кэша и временных файлов:

```Dockerfile
FROM ubuntu:latest

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y nginx
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
COPY site /var/www/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Собрала образ:

```bash
docker image build -t mynginx:clean -f Dockerfile.clean .
```

---

### 4️ Объединение слоёв (mynginx:few)

В `Dockerfile.few` я объединила все команды `RUN` в одну:

```Dockerfile
FROM ubuntu:latest

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y nginx && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
COPY site /var/www/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Сборка:

```bash
docker image build -t mynginx:few -f Dockerfile.few .
```

---

### 5️ Минимальный базовый образ (mynginx:alpine)

Создала `Dockerfile.alpine` с использованием Alpine:

```Dockerfile
FROM alpine:latest

RUN apk update && apk upgrade
RUN apk add nginx
COPY site /var/www/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Сборка:

```bash
docker image build -t mynginx:alpine -f Dockerfile.alpine .
```

---

### 6️ Перепаковка образа (mynginx:repack)

Я перепаковала образ `mynginx:raw`:

```bash
docker container create --name mynginx mynginx:raw
docker container export mynginx | docker image import - mynginx:repack
docker container rm mynginx
```

---

### 7️ Использование всех методов (mynginx:min + minx)

Создала максимально оптимизированный образ:

**`Dockerfile.min`:**

```Dockerfile
FROM alpine:latest

RUN apk update && apk upgrade && \
    apk add nginx && \
    rm -rf /var/cache/apk/*
COPY site /var/www/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Сборка и перепаковка:

```bash
docker image build -t mynginx:minx -f Dockerfile.min .
docker container create --name mynginx mynginx:minx
docker container export mynginx | docker image import - mynginx:min
docker container rm mynginx
```

---

## Таблица размеров образов

![Image](https://github.com/user-attachments/assets/ee3cd185-3803-4846-8ced-3312d8fc45e5)
---

## Ответы на вопросы

**1️ Какой метод оптимизации образов я считаю наиболее эффективным?**

Наиболее эффективным методом, на мой взгляд, оказалось использование минимального базового образа (Alpine) в сочетании с удалением ненужных файлов и перепаковкой. Этот способ дал самое значительное уменьшение размера образа.

---

**2️ Почему очистка кэша пакетов в отдельном слое не уменьшает размер образа?**

Потому что каждый слой в Docker остаётся неизменным. Если в одном слое я скачала пакеты, а в другом их удалила, то Docker всё равно хранит предыдущий слой полностью. Поэтому очистку нужно делать в том же слое, где была установка.

---

**3️ Что такое перепаковка образа?**

Перепаковка — это процесс, когда я запускаю контейнер из образа, экспортирую его файловую систему и импортирую обратно как новый образ. Это убирает историю слоёв и иногда помогает дополнительно уменьшить размер.

---

## Выводы

В ходе этой лабораторной работы я изучила и на практике опробовала разные методы оптимизации Docker-образов. Я увидела, как влияют на размер образа:

- удаление временных файлов,
- объединение слоёв,
- выбор минимальной базы (Alpine),
- перепаковка.

В итоге я получила чёткое представление, как строить компактные и оптимизированные образы, что очень полезно для реальных проектов.

