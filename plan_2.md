# План подготовки

## Содержание

- [a) Схема зависимостей](#a-схема-зависимостей)
- [Проверка исходных данных](#проверка-исходных-данных)
- [b) Итерации](#b-итерации)
  - [Блок 1. Оптимизация](#блок-1-оптимизация)
  - [Блок 2. Линейная алгебра](#блок-2-линейная-алгебра)
  - [Блок 3. Общая база по ML](#блок-3-общая-база-по-ml)
  - [Блок 4. CV](#блок-4-cv)
  - [Блок 5. NLP и LLM](#блок-5-nlp-и-llm)
- [Вывод](#вывод)

---

## a) Схема зависимостей

![Схема зависимостей блоков](assets/diagram.jpg)

**Логика связей:**

- **Линейная алгебра** — корень, ни от чего не зависит: без неё не понять ни выпуклость/градиенты в Оптимизации, ни матричные операции в ML.
- **Оптимизация** зависит от Линейной алгебры (нормы, спектральный анализ, квадратичные формы нужны для EE364A и Караманиса).
- **Общая база по ML** зависит только от Линейной алгебры (плюс своя вероятность из CS109) — для CS229/CS229M глубокая теория выпуклой оптимизации не обязательна, хватает базового градиентного спуска. Идёт **параллельно** Оптимизации, а не после неё.
- **CV** зависит от Общей базы по ML — CS198-126 сразу опирается на нейросети/обучение с учителем из CS229.
- **NLP и LLM** — самый "верхний" блок: требует и продвинутой Оптимизации (SGD/Adam-подобные методы, второй порядок), и Общей базы по ML (нейросети, backprop). На схеме в него ведут обе стрелки.

Это не противоречит исходному примеру (NLP после Оптимизации; Общая база по ML и CV не зависят от Оптимизации) — просто уточняет его.

---

## Проверка исходных данных

Количество видео в плейлистах проверено напрямую (`yt-dlp`):

| Источник | Кол-во видео | Плейлист |
| --- | --- | --- |
| EE364A | 18 | [открыть](https://www.youtube.com/watch?v=kV1ru-Inzl4&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h) |
| Caramanis | 58 (**12** тематических блоков) | [открыть](https://www.youtube.com/playlist?list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc) |
| CS109 | 29 | [открыть](https://www.youtube.com/playlist?list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg) |
| CS229 | 19 (лекция 19 в плейлисте отсутствует; после 18-й идёт "Lecture 20") | [открыть](https://www.youtube.com/playlist?list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy) |
| CS229M | 20 (⚠ "Lecture 12" стоит последней в плейлисте — смотреть по номеру лекции) | [открыть](https://www.youtube.com/playlist?list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh) |
| CS198-126 (CV) | 22 | [открыть](https://www.youtube.com/playlist?list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5) |

У каждой лекции в таблицах ниже — прямая ссылка `watch?v=…` (с `list=` на плейлист).

---

## b) Итерации

### Блок 1. Оптимизация

**EE364A** — [плейлист](https://www.youtube.com/playlist?list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h):

| Итерация | Лекции | Практика |
| --- | --- | --- |
| 1 | [1](https://www.youtube.com/watch?v=kV1ru-Inzl4&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=1), [2](https://www.youtube.com/watch?v=2H4_7izio9Y&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=2), [3](https://www.youtube.com/watch?v=1menqhfNzzo&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=3) — intro, выпуклые множества, выпуклые функции | — |
| 2 | [4](https://www.youtube.com/watch?v=U2HRwA7XePU&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=4), [5](https://www.youtube.com/watch?v=AAjG1TQcL7c&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=5) — задачи выпуклой оптимизации, двойственность | Проверка выпуклости функции по Гессиану на 3–4 тестовых функциях |
| 3 | [6](https://www.youtube.com/watch?v=d2jF3SXcFQ8&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=6), [7](https://www.youtube.com/watch?v=P_SuSVZnrT0&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=7), [8](https://www.youtube.com/watch?v=wsRznzNgTS0&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=8) — аппроксимация/fitting, стат. оценивание, геометрические задачи | — |
| 4 | [9](https://www.youtube.com/watch?v=whE03c84ahA&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=9), [10](https://www.youtube.com/watch?v=N3V2AdTImJE&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=10) — численная линалгебра, безусловная минимизация | Градиентный спуск (1-й порядок) с нуля + тест сходимости |
| 5 | [11](https://www.youtube.com/watch?v=trs0RI39uWI&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=11), [12](https://www.youtube.com/watch?v=t8sp9rv-Dqo&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=12), [13](https://www.youtube.com/watch?v=ankx1lGi5jI&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=13), [14](https://www.youtube.com/watch?v=dAvxvA4_Euo&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=14) — условная минимизация, методы внутренней точки | Координатный спуск / random search (0-й порядок) с нуля, сравнение с GD |
| 6 | [15](https://www.youtube.com/watch?v=zVO4ccvrwrI&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=15), [16](https://www.youtube.com/watch?v=Sx7TKDFJjmk&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=16), [17](https://www.youtube.com/watch?v=vcTIA2X0UVk&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=17), [18](https://www.youtube.com/watch?v=4A5opemjRW4&list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h&index=18) — оставшиеся темы курса | — |

**Caramanis** — [плейлист](https://www.youtube.com/playlist?list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc):

| Итерация | Лекции | Практика |
| --- | --- | --- |
| 7 | [1.1](https://www.youtube.com/watch?v=ee-HYD6kKqM&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=1), [1.2](https://www.youtube.com/watch?v=QcZJBkL7rhk&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=2), [1.3](https://www.youtube.com/watch?v=p7BZKqXL0ak&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=3), [1.4](https://www.youtube.com/watch?v=FTzZff0uq9U&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=4) — введение в курс, обзор, первые примеры, база линалгебры/анализа | — |
| 8 | [2.1](https://www.youtube.com/watch?v=hNRtGmrgr2g&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=5), [2.2](https://www.youtube.com/watch?v=7JHr0eL7YCY&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=6), [2.3](https://www.youtube.com/watch?v=FNiJJL-1xVw&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=7) — выпуклые множества: определения, примеры, выпуклые функции | — |
| 9 | [2.4](https://www.youtube.com/watch?v=2c5UyW9M4g0&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=8), [2.5](https://www.youtube.com/watch?v=oS4kCcFOJGg&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=9), [2.6](https://www.youtube.com/watch?v=mg0l36wI_Ek&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=10) — эквивалентные определения выпуклости, условия оптимальности, проекция | Проверка выпуклости по Гессиану |
| 10 | [3.1](https://www.youtube.com/watch?v=ejIgu3UZM9c&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=11), [3.2](https://www.youtube.com/watch?v=Clw24Fajnqg&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=12), [3.3](https://www.youtube.com/watch?v=BQyHULGB4fY&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=13), [3.4](https://www.youtube.com/watch?v=R8kL8CKyz5I&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=14) — Gradient & Subgradient Descent, smooth/strongly convex, скорости сходимости | Subgradient descent (1-й порядок) с нуля + тест скорости сходимости |
| 11 | [4.1](https://www.youtube.com/watch?v=DL6i8BIZt0A&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=15), [4.2](https://www.youtube.com/watch?v=D1TseaVu9Nc&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=16) — Oracle Lower Bounds, Accelerated Gradient Descent | Nesterov AGD с нуля, сравнение с обычным GD |
| 12 | [5.1](https://www.youtube.com/watch?v=m73Fy_rHV0A&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=17), [5.2](https://www.youtube.com/watch?v=ifK85fCxtcA&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=18), [5.3](https://www.youtube.com/watch?v=zWgzHQR8dh4&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=19), [5.4](https://www.youtube.com/watch?v=JRerBpNggN0&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=20) — Proximal/Projected GD, свойства, скорости сходимости, ISTA/FISTA | ISTA/FISTA с нуля на L1-регуляризованной задаче |
| 13 | [5.5](https://www.youtube.com/watch?v=m_SJafYedbQ&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=21), [5.6](https://www.youtube.com/watch?v=DTvDRHWWWGc&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=22), [5.7](https://www.youtube.com/watch?v=UtoI5zsB3ZQ&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=23), [5.8](https://www.youtube.com/watch?v=Up-Ks0P5AoY&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=24), [5.9](https://www.youtube.com/watch?v=ArTZybO1CGc&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=25), [5.10](https://www.youtube.com/watch?v=wV3k4o92V1c&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=26), [5.11](https://www.youtube.com/watch?v=BGDCqAvLoHw&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=27), [5.12](https://www.youtube.com/watch?v=tIywqa-OgoI&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=28) — Mirror Descent, части 1–6, Frank-Wolfe | Mirror Descent или Frank-Wolfe с нуля |
| 14 | [6.1](https://www.youtube.com/watch?v=Z_FW352X2IA&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=29), [6.2](https://www.youtube.com/watch?v=9mUYxyTYaX4&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=30), [6.3](https://www.youtube.com/watch?v=fU7UFzKF4xg&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=31), [6.4](https://www.youtube.com/watch?v=hwm2mr8PBhs&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=32), [6.5](https://www.youtube.com/watch?v=dhVRKzybsck&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=33) — SGD, SVRG | SGD и SVRG с нуля, сравнение сходимости |
| 15 | [7.1](https://www.youtube.com/watch?v=NanGIMVYH7c&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=34), [7.2](https://www.youtube.com/watch?v=NIyIJYmCTcc&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=35), [7.3](https://www.youtube.com/watch?v=Bh3UWxsEoTc&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=36), [7.4](https://www.youtube.com/watch?v=ZPb7HXtIqDE&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=37) — метод Ньютона: вид, афинные преобразования, сходимость, доказательство | Метод Ньютона (2-й порядок) с нуля, тест квадратичной сходимости |
| 16 | [8.1](https://www.youtube.com/watch?v=UvGQRAA8Yms&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=38), [8.2](https://www.youtube.com/watch?v=QGFct_3HMzk&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=39), [9.1](https://www.youtube.com/watch?v=q4iXHLM72FY&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=40), [9.2](https://www.youtube.com/watch?v=lQpOXOTKTw8&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=41), [9.3](https://www.youtube.com/watch?v=U0cUcsGCS1A&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=42), [9.4](https://www.youtube.com/watch?v=3pmAJOitNU4&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=43) — Quasi-Newton/BFGS, Interior Point Methods | Опционально: BFGS с нуля |
| 17 | [10.1](https://www.youtube.com/watch?v=CwDcth9J_7U&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=44), [10.2](https://www.youtube.com/watch?v=-4ux8xo9QWw&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=45), [10.3](https://www.youtube.com/watch?v=Re8OZk7jO_0&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=46), [10.4](https://www.youtube.com/watch?v=Rvx2vcJ1jXA&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=47), [11.1](https://www.youtube.com/watch?v=q4Eig1U72Ww&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=48), [11.2](https://www.youtube.com/watch?v=pL_t2X72vek&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=49), [11.3](https://www.youtube.com/watch?v=dWCT8PnVA5Y&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=50), [11.4](https://www.youtube.com/watch?v=i5fs8caiTLU&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=51), [11.5](https://www.youtube.com/watch?v=iEl-tS4CZWM&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=52), [11.6](https://www.youtube.com/watch?v=lks7kCNQNlg&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=53) — Fenchel Dual, Dual Decomposition, Proximal Point/ALM | — |
| 18 | [12.1](https://www.youtube.com/watch?v=VsAUznfNe1o&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=54), [12.2](https://www.youtube.com/watch?v=fn3uFc41R60&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=55), [12.3](https://www.youtube.com/watch?v=255Ey2vkOg4&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=56), [12.4](https://www.youtube.com/watch?v=n6zYFWoY8Uc&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=57), [12.5](https://www.youtube.com/watch?v=GVGxveZTgjw&list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc&index=58) — Monotone Operators, Douglas-Rachford splitting, ADMM | ADMM с нуля на задаче Lasso, тест сходимости |

### Блок 2. Линейная алгебра

Книга: [Linear Algebra Done Right (LADR 4e, PDF)](https://linear.axler.net/LADR4e.pdf), 10 глав.

| Итерация | Материал | Практика |
| --- | --- | --- |
| 1 | [Гл. 1 Vector Spaces](https://linear.axler.net/LADR4e.pdf) | Задачи из конца главы |
| 2 | [Гл. 2 Finite-Dimensional Vector Spaces](https://linear.axler.net/LADR4e.pdf) | Задачи из конца главы |
| 3 | [Гл. 3 Linear Maps](https://linear.axler.net/LADR4e.pdf) | Задачи из конца главы |
| 4 | [Гл. 4 Polynomials](https://linear.axler.net/LADR4e.pdf) | Задачи выборочно (глава менее критична для ML) |
| 5 | [Гл. 5 Eigenvalues and Eigenvectors](https://linear.axler.net/LADR4e.pdf) | Задачи + важно для ML, не пропускать |
| 6 | [Гл. 6 Inner Product Spaces](https://linear.axler.net/LADR4e.pdf) | Задачи из конца главы |
| 7 | [Гл. 7 Operators on Inner Product Spaces (SVD)](https://linear.axler.net/LADR4e.pdf) | Задачи из конца главы |
| 8 | [Гл. 8–9 Operators on Complex/Real Vector Spaces](https://linear.axler.net/LADR4e.pdf) | Задачи выборочно |
| 9 | [Гл. 10 Trace and Determinant](https://linear.axler.net/LADR4e.pdf) | Задачи из конца главы |
| 10 | — | Реализовать power iteration для собственных значений и упрощённый SVD на Python, сверить с `numpy.linalg` |

### Блок 3. Общая база по ML

**CS109** — [плейлист](https://www.youtube.com/playlist?list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg):

| Итерация | Лекции | Практика |
| --- | --- | --- |
| 1 | [1](https://www.youtube.com/watch?v=2MuDZIAzBMY&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=1), [2](https://www.youtube.com/watch?v=ag4Ei15CG0c&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=2), [3](https://www.youtube.com/watch?v=EGgMCE2AgyU&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=3) — счёт, комбинаторика, что такое вероятность | — |
| 2 | [4](https://www.youtube.com/watch?v=NHRoXvPaZqY&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=4), [5](https://www.youtube.com/watch?v=zTJDZ2wmaRU&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=5), [6](https://www.youtube.com/watch?v=8QCg2ur-3fo&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=6) — условная вероятность и Байес, независимость, случайные величины и ожидание | Задачи на условную вероятность/Байеса |
| 3 | [7](https://www.youtube.com/watch?v=I2UBspTNAG0&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=7), [8](https://www.youtube.com/watch?v=QV3IRiG6dVs&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=8), [9](https://www.youtube.com/watch?v=OFgBn4rQkqc&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=9), [10](https://www.youtube.com/watch?v=rpB_NNXiWlM&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=10) — дисперсия/Бернулли/Биномиальное, Пуассон, непрерывные величины, нормальное распределение | Смоделировать распределения в Python, оценка Монте-Карло |
| 4 | [11](https://www.youtube.com/watch?v=8Il2M7kbQSc&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=11), [12](https://www.youtube.com/watch?v=fvgQBAsg5Zo&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=12), [13](https://www.youtube.com/watch?v=d0ImA7m4BEg&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=13), [14](https://www.youtube.com/watch?v=q9lk8l8P-E4&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=14) — совместные распределения, инференс I–II, моделирование | — |
| 5 | [15](https://www.youtube.com/watch?v=c0QGjtu9GZg&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=15), [16](https://www.youtube.com/watch?v=aOhk9mFrHdU&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=16), [17](https://www.youtube.com/watch?v=UEyHbI9FRtM&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=17), [18](https://www.youtube.com/watch?v=6Q9wT6JGMMM&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=18), [19](https://www.youtube.com/watch?v=NXJwyPT1vsc&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=19) — общий инференс, Beta, сумма случ. величин, ЦПТ, bootstrap/p-values | Демонстрация ЦПТ и bootstrap в Python |
| 6 | [20](https://www.youtube.com/watch?v=Ht9yUPtppwY&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=20), [21](https://www.youtube.com/watch?v=utFEufMXHgw&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=21), [22](https://www.youtube.com/watch?v=sL1zOr-P4xc&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=22) — алгоритмический анализ, MLE, MAP | MLE/MAP с нуля для простого распределения |
| 7 | [23](https://www.youtube.com/watch?v=yqF3DvDVpvw&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=23), [24](https://www.youtube.com/watch?v=ILqZWvDWKEc&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=24) — наивный Байес, логистическая регрессия | Наивный Байес и логрег с нуля |
| 8 | [25](https://www.youtube.com/watch?v=MSfI6TTgyl4&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=25), [26](https://www.youtube.com/watch?v=cbzwbr5H_LA&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=26), [27](https://www.youtube.com/watch?v=BquE8Z9htws&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=27), [28](https://www.youtube.com/watch?v=SoXygq5LtiM&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=28), [29](https://www.youtube.com/watch?v=yyKSsjRt42o&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg&index=29) — Deep Learning intro, Fairness, Advanced Probability, Future of Probability | — |

**CS229** — [плейлист](https://www.youtube.com/playlist?list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy):

| Итерация | Лекции | Практика |
| --- | --- | --- |
| 9 | [1](https://www.youtube.com/watch?v=Bl4Feh_Mjvo&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=1), [2](https://www.youtube.com/watch?v=gqKaVgQxEJ0&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=2), [3](https://www.youtube.com/watch?v=k_pDh_68K6c&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=3) — введение, LMS, Weighted LS/логрег/Ньютон | Линейная и логистическая регрессия с нуля (переиспользовать GD из блока 1) |
| 10 | [4](https://www.youtube.com/watch?v=goDDnBbJQ4g&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=4), [5](https://www.youtube.com/watch?v=RMy_1mO4HLk&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=5), [6](https://www.youtube.com/watch?v=ADj95edZc0w&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=6) — экспоненциальное семейство/GLM, GDA/наивный Байес, Laplace smoothing | — |
| 11 | [7](https://www.youtube.com/watch?v=dzDOqrac9Ks&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=7), [8](https://www.youtube.com/watch?v=ZMxfDWPXmjc&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=8), [9](https://www.youtube.com/watch?v=UbtTv7j1tzU&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=9) — ядра, нейросети 1–2/backprop | Простая NN (forward/backward) с нуля |
| 12 | [10](https://www.youtube.com/watch?v=7AQYw5FOVcw&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=10), [11](https://www.youtube.com/watch?v=NirZnqwYfYU&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=11) — bias-variance/регуляризация, feature/model selection | — |
| 13 | [12](https://www.youtube.com/watch?v=LMZZPneTcP4&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=12), [13](https://www.youtube.com/watch?v=khTGx7m3Y8A&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=13), [14](https://www.youtube.com/watch?v=o2KzJdbOwMc&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=14), [15](https://www.youtube.com/watch?v=FVLZG_oHUIw&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=15) — k-means, GMM non-EM/EM, factor analysis/PCA, PCA/ICA | k-means, GMM/EM и PCA с нуля |
| 14 | [16](https://www.youtube.com/watch?v=6N3OAWIsUOU&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=16), [17](https://www.youtube.com/watch?v=6ZYx_1NlYbI&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=17), [18](https://www.youtube.com/watch?v=UyPn-QR8A7I&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=18), [19](https://www.youtube.com/watch?v=gPCd0xx_OYI&list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy&index=19) — self-supervised learning, основы RL, societal impact, model-based RL | — |

**CS229M** — [плейлист](https://www.youtube.com/playlist?list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh) (⚠ смотреть по *номеру* лекции; лекция 12 в плейлисте стоит последней):

| Итерация | Лекции (по номеру) | Практика |
| --- | --- | --- |
| 15 | [1](https://www.youtube.com/watch?v=I-tmjGFaaBg&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=1), [2](https://www.youtube.com/watch?v=Fx3xldCEfsM&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=2), [3](https://www.youtube.com/watch?v=io-YFfXbIXk&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=3), [4](https://www.youtube.com/watch?v=fKM6fcOkXuk&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=4) — overview/ERM, uniform convergence/Hoeffding, гипотезы классов, концентрационные неравенства | Эмпирически проверить границу Хёфдинга |
| 16 | [5](https://www.youtube.com/watch?v=tkJd2B98hII&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=5), [6](https://www.youtube.com/watch?v=echF7IWE05c&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=6) — Rademacher complexity, margin theory для линейных моделей | — |
| 17 | [7](https://www.youtube.com/watch?v=kVkMRDZ5fcU&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=7), [8](https://www.youtube.com/watch?v=gwKfeDRCvSg&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=8), [9](https://www.youtube.com/watch?v=wDfardbL50I&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=9), [10](https://www.youtube.com/watch?v=P5-VVI1qLxA&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=10) — генерализация для нейросетей, теория ядер, covering numbers/Dudley, bounds для глубоких сетей | — |
| 18 | [11](https://www.youtube.com/watch?v=GeXBfyrKfM4&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=11), [12](https://www.youtube.com/watch?v=EVyJkXOd5Xo&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=20) — all-layer margin, невыпуклая оптимизация/PCA/matrix completion | Невыпуклая PCA или matrix completion — игрушечный пример |
| 19 | [13](https://www.youtube.com/watch?v=btphvvnad0A&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=12), [14](https://www.youtube.com/watch?v=xpT1ymwCk9w&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=13), [15](https://www.youtube.com/watch?v=l-CR_TLihdg&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=14), [16](https://www.youtube.com/watch?v=mham4hHpo7A&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=15), [17](https://www.youtube.com/watch?v=60GqpISCtCU&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=16) — Neural Tangent Kernel ×2, implicit regularization: инициализация/классификация/шум | — |
| 20 | [18](https://www.youtube.com/watch?v=4xDEsLUkdG4&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=17), [19](https://www.youtube.com/watch?v=E6rZeGIKdRY&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=18), [20](https://www.youtube.com/watch?v=UYBRLG64oSQ&list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh&index=19) — unsupervised: mixture of Gaussians/moment methods, spectral clustering | Spectral clustering vs GMM на модельных данных |

### Блок 4. CV

**CS198-126** — [плейлист](https://www.youtube.com/playlist?list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5) (⚠ diffusion models — лекция 12):

| Итерация | Лекции | Практика |
| --- | --- | --- |
| 21 | [1](https://www.youtube.com/watch?v=Q3fqoJ41g6U&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=1), [2](https://www.youtube.com/watch?v=XBT8tuslJRE&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=2), [3](https://www.youtube.com/watch?v=wAhKtzlBEBg&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=3), [4](https://www.youtube.com/watch?v=zz4avbrwmmo&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=4), [5](https://www.youtube.com/watch?v=lkTIahRB_fE&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=5) — Intro to ML, Intro to DL ч.1–2, Pretraining/Augmentations, Intro to CV | — |
| 22 | [6](https://www.youtube.com/watch?v=2GtYNKJSv50&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=6), [7](https://www.youtube.com/watch?v=O63hvwsEJ_c&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=7) — Advanced CV Architectures, Object Detection | Обучить простую CNN на CIFAR-10 (PyTorch) |
| 23 | [8](https://www.youtube.com/watch?v=kxzB2p9gzWU&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=8), [9](https://www.youtube.com/watch?v=ceu7CESRsI0&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=9) — Semantic Segmentation, Autoencoders/VAE/Generative Modeling | — |
| 24 | [10](https://www.youtube.com/watch?v=VXgmL2xP0i4&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=10), [11](https://www.youtube.com/watch?v=0tPq8sFTW7w&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=11), [12](https://www.youtube.com/watch?v=687zEGODmHA&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=12) — GANs, Advanced GANs, Diffusion Models | Обучить GAN на MNIST (диффузию — опционально, как демо) |
| 25 | [13](https://www.youtube.com/watch?v=dEiued7ljWE&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=13), [14](https://www.youtube.com/watch?v=5SClruyUnoU&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=14), [15](https://www.youtube.com/watch?v=jzPbx9Y0vHg&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=15), [16](https://www.youtube.com/watch?v=QEWa3m68vIs&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=16) — Sequence Modeling, Transformers/Attention, Vision Transformers, Advanced Detection/Segmentation | Transfer learning: дообучить предобученный ViT/детектор на своём датасете |
| 26 | [17](https://www.youtube.com/watch?v=yRXL0iw0HFI&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=17), [18](https://www.youtube.com/watch?v=DEda9G6_UKk&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=18), [19](https://www.youtube.com/watch?v=kg45Na2ejv4&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=19) — 3D Vision Survey ч.1–2, Advanced Vision Pretraining | — |
| 27 | [20](https://www.youtube.com/watch?v=2F0tYkpEgm8&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=20), [21](https://www.youtube.com/watch?v=lUIzI91Il0s&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=21), [22](https://www.youtube.com/watch?v=_Y-D5jrX7IQ&list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5&index=22) — Stylizing Images, Generative Audio, Multimodal Learning | — |

### Блок 5. NLP и LLM

Наполнение будет добавлено позже (по условию задачи рассматривается как отдельный блок).

---

## Вывод

- Схема зависимостей (пункт a) логически корректна и соответствует исходному примеру.
- Количество видео в плейлистах сверено через `yt-dlp`; итерации привязаны к реальным названиям лекций.
- У **каждой** лекции в таблицах — прямая ссылка `https://www.youtube.com/watch?v=…` (плюс `list=` на плейлист).
- Следующий шаг — календарный план (недели на итерацию) и наполнение блока NLP и LLM.
