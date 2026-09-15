import type { Metadata } from "next";
import Link from "next/link";
import { Mark, Wordmark } from "@/components/Brand";
import { Bars } from "@/components/landing/Bars";
import { LogoWall } from "@/components/landing/LogoWall";
import { NavSpy } from "@/components/landing/NavSpy";
import { Reveal } from "@/components/landing/Reveal";
import { ProductSection } from "@/components/product/ProductSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { asset } from "@/lib/asset";

/**
 * The landing page.
 *
 * Set in the shop's own language: Fixel Display, the magenta of the sign,
 * photographs of the actual stores and the actual goods. Every number on it
 * comes from a run of the system on 6 September 2026 against the real
 * catalogue and the shop's own exports, and the page says where each one
 * came from. A figure with its method attached is the only kind worth
 * printing; "up to 40% more revenue" is what every competitor's page already
 * says, and a shop owner has read it enough times to have stopped seeing it.
 */

const description =
  "Отвечает покупателям по реальным остаткам, считает спрос и сам заказывает у поставщиков в пределах бюджета, который задали вы.";

export const metadata: Metadata = {
  title: "Hayat Beauty: ассистент магазина",
  description,
  openGraph: {
    title: "Hayat Beauty: ассистент магазина",
    description,
    locale: "ru_RU",
    type: "website",
    images: [{ url: "/brand/stores/vatan-1600.webp", width: 1600, height: 900 }],
  },
};

/* What an ordinary buyer lost over 25 simulated months on the real catalogue
 * (cmd/synth -calibrate, 6 September 2026). */
const losses = [
  { n: "27 920", u: "шт", l: "продаж упущено на пустой полке" },
  { n: "61 602", u: "шт", l: "списано по сроку годности" },
  { n: "52 068", u: "", l: "заявок поставщикам оформлено вручную" },
  { n: "125 994", u: "", l: "чеков в истории, на которой это посчитано" },
];

/* Walk-forward backtest on the calibrated world: forecast error relative to
 * the seasonal naive base, four cuts, 21-day horizon. Below 1 beats the base. */
const folds = [
  { label: "13 июня", value: 0.96 },
  { label: "4 июля", value: 0.966 },
  { label: "25 июля", value: 0.928 },
  { label: "15 августа", value: 0.956 },
];

/* Forecast cut on 1 August 2026, scored per SKU against the shop's own August
 * sales export (cmd/forecast -backtest -real 2026-08). */
const bases = [
  { label: "наивная база", value: 0.815, strong: true },
  { label: "сезонная база", value: 0.868, strong: true },
  { label: "скользящее среднее", value: 1.01 },
];

/* Repeat-purchase backtest (cmd/repeat -backtest): last purchase of every
 * buyer × product pair hidden, hit = within ±25% of the cycle. */
const repeat = [
  { label: "ассистент", value: 72.3, strong: true },
  { label: "память продавца", value: 60.0 },
];

/* August's best sellers by the shop's export, with the catalogue's photos. */
const shelf = [
  { img: "althea-345", name: "Dr.Althea 345 relief cream", price: 236 },
  { img: "boj-rice-spf", name: "Beauty of Joseon relief sun SPF50", price: 160 },
  { img: "roundlab-birch-spf", name: "Round Lab birch juice sunscreen", price: 175 },
  { img: "skin1004-sun-serum", name: "SKIN1004 hyalu-cica sun serum", price: 176 },
];

const guards = [
  {
    title: "Месячный бюджет",
    body: "Кончился, и заявки копятся в очереди, а не уходят. Списание блокирует строку в базе, так что два прохода не потратят одни деньги дважды.",
  },
  {
    title: "Порог маржи",
    body: "Позиция с маржой ниже вашего порога не заказывается, как бы хорошо она ни продавалась.",
  },
  {
    title: "Потолок запаса",
    body: "Не больше заданного числа дней спроса. Запас на год у средства со сроком 18 месяцев протухнет раньше, чем продастся.",
  },
  {
    title: "Холодный старт",
    body: "Товар, который прогнозист видел меньше 60 дней, уходит человеку на подтверждение. Автономия над моделью, которая ещё не была права, не автономия.",
  },
];

const extras = [
  {
    t: "Фото вместо описания",
    d: "Флакон у подруги, полка в чужом магазине, скриншот списка. Читаем этикетку в те же поля, что и каталог, и говорим, есть ли у нас это или аналог по составу.",
  },
  {
    t: "Голосовое сообщение",
    d: "Человек, который не станет печатать три абзаца про свою кожу, наговорит их за двадцать секунд. Расшифровка идёт в тот же планировщик, что и текст.",
  },
  {
    t: "Дневник кожи",
    d: "Уход на неделю с трекингом и без диагнозов: только то, что человек сказал о себе, и арифметика над этим.",
  },
  {
    t: "Протокол для ИИ-агентов",
    d: "Машинная витрина: структурный фид, сессия оформления, резерв стока, мандат покупателя с потолком. Чужой ассистент может купить у вас, не открывая сайт.",
  },
];

const ratio = (v: number) => v.toFixed(2).replace(".", ",");
const percent = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;

function Photo({
  name,
  alt,
  width,
  height,
  sizes,
  priority = false,
}: {
  name: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(`/brand/stores/${name}-1600.webp`)}
      srcSet={`${asset(`/brand/stores/${name}-800.webp`)} 800w, ${asset(`/brand/stores/${name}-1600.webp`)} 1600w`}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}

export default function Landing() {
  return (
    <main className="lp" id="main">
      <a className="lp-skip" href="#how">
        К содержанию
      </a>

      <header className="lp-nav">
        <Link href="/" className="lp-brand" aria-label="Hayat Beauty, на главную">
          <Mark size={30} />
          <span className="lp-brand-text">
            <Wordmark />
            <span className="lp-brand-sub">ассистент магазина</span>
          </span>
        </Link>
        <nav className="lp-nav-links" aria-label="Разделы страницы">
          <a href="#product">Продукт</a>
          <a href="#how">Как работает</a>
          <a href="#safety">Рамка</a>
          <a href="#stores">Магазины</a>
          <ThemeToggle compact />
          <Link href="/app" className="lp-btn lp-btn--primary lp-btn--sm">
            Открыть ассистента
          </Link>
        </nav>
        <NavSpy ids={["product", "how", "safety", "stores"]} />
      </header>

      {/* ---- Hero: the claim on the left, the shop itself on the right ---- */}
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <h1 className="lp-h1 lp-in">
            Магазин, который знает, <span className="lp-accent">что заказать и почему</span>
          </h1>
          <p className="lp-lede lp-in lp-in--1">
            {description}
          </p>
          <div className="lp-cta-row lp-in lp-in--2">
            <Link href="/app" className="lp-btn lp-btn--primary lp-btn--lg">
              Открыть ассистента
            </Link>
            <a href="#how" className="lp-btn lp-btn--ghost lp-btn--lg">
              Как работает
            </a>
          </div>
        </div>

        <figure className="lp-hero-photo lp-in lp-in--1">
          <Photo
            name="vatan"
            alt="Фасад магазина Hayat Beauty на улице Дехлави в Душанбе: чёрная вывеска, белые буквы и розовое кольцо HB"
            width={1600}
            height={900}
            sizes="(max-width: 900px) 100vw, 44vw"
            priority
          />
          <figcaption>Hayat Beauty на улице Х. Дехлави, Душанбе</figcaption>
        </figure>
      </section>

      {/* ---- The product, taken apart and put back together ---- */}
      <ProductSection />

      {/* ---- The shelf: what is actually on it ---- */}
      <section className="lp-brands" aria-labelledby="brands-line">
        <p className="lp-brands-line" id="brands-line">
          На полках трёх магазинов и онлайн-витрины: <strong>11&nbsp;032 товара</strong> от{" "}
          <strong>455 брендов</strong>
        </p>
        <LogoWall />
      </section>

      {/* ---- What the ordinary buyer loses ---- */}
      <section className="lp-band">
        <div className="lp-band-copy">
          <Reveal>
            <h2 className="lp-h2">Что теряет обычный закупщик</h2>
          </Reveal>
          <Reveal delay={60}>
            <p className="lp-section-lede">
              Каталог настоящий, торговля по нему смоделирована за 25 месяцев. Так закупает
              человек с таблицей и памятью, и вот что у него выходит.
            </p>
          </Reveal>
          <Reveal delay={120} as="dl" className="lp-stats">
            {losses.map((s) => (
              <div className="lp-stat" key={s.l}>
                <dt className="lp-stat-l">{s.l}</dt>
                <dd>
                  <span className="lp-stat-n tabular">{s.n}</span>
                  {s.u && <span className="lp-stat-u">{s.u}</span>}
                </dd>
              </div>
            ))}
          </Reveal>
        </div>
        <Reveal delay={90} as="figure" className="lp-band-photo">
          <Photo
            name="shelves"
            alt="Полки магазина Hayat Beauty: шампуни и уход за волосами на красной стене"
            width={1600}
            height={900}
            sizes="(max-width: 900px) 100vw, 44vw"
          />
          <figcaption>Полка в магазине на Дехлави</figcaption>
        </Reveal>
      </section>

      {/* ---- The four heads ---- */}
      <section className="lp-section" id="how">
        <Reveal>
          <h2 className="lp-h2">Четыре головы одной системы</h2>
        </Reveal>
        <Reveal delay={60}>
          <p className="lp-section-lede">
            Снабженец вычитает из прогноза, прогноз ест историю чеков, аналитик пересказывает
            то, что уже посчитано. Ни одна не может врать незаметно для остальных.
          </p>
        </Reveal>

        <div className="lp-bento">
          <Reveal as="article" className="lp-tile lp-tile--wide">
            <h3 className="lp-tile-title">Консультант</h3>
            <p className="lp-tile-line">Отвечает по реальным остаткам</p>
            <p className="lp-tile-body">
              Покупатель пишет «нужен крем для сухой кожи до 150 сомони», присылает фото флакона
              или голосовое. Ассистент собирает корзину из того, что действительно есть на полке,
              а замену по составу называет заменой.
            </p>
            <ul className="lp-shelf" aria-label="Лучшие позиции августа по выгрузке магазина">
              {shelf.map((p) => (
                <li className="lp-shelf-item" key={p.img}>
                  <span className="lp-shelf-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset(`/brand/products/${p.img}.webp`)}
                      alt={p.name}
                      width={520}
                      height={700}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="lp-shelf-name">{p.name}</span>
                  <span className="lp-shelf-price tabular">{p.price} TJS</span>
                </li>
              ))}
            </ul>
            <p className="lp-tile-note">Лучшие позиции августа по выгрузке магазина</p>
          </Reveal>

          <Reveal delay={80} as="article" className="lp-tile lp-tile--chart">
            <h3 className="lp-tile-title">Прогнозист</h3>
            <p className="lp-tile-line">Считает спрос, а не угадывает</p>
            <p className="lp-tile-body">
              Сезонность, повторные покупки, редкий спрос. Три четверти каталога продаётся по
              несколько штук в месяц, и для таких рядов здесь отдельная математика. Её точность
              измерена, а не заявлена.
            </p>
            <Bars
              items={folds}
              max={1.1}
              format={ratio}
              reference={{ value: 1, label: "уровень сезонной базы" }}
              caption="Ошибка прогноза на четырёх срезах, меньше единицы значит лучше базы."
            />
          </Reveal>

          <Reveal delay={160} as="article" className="lp-tile lp-tile--brand">
            <h3 className="lp-tile-title">Снабженец</h3>
            <p className="lp-tile-line">Сам оформляет заявку поставщику</p>
            <p className="lp-tile-body">
              Видит дыру в остатках, считает доходность и сравнивает поставщиков по итоговой
              стоимости, а не по прайсу. Дешёвый поставщик с трёхнедельным сроком и восемью
              процентами недопоставок часто выходит дороже быстрого.
            </p>
          </Reveal>

          <Reveal delay={240} as="article" className="lp-tile lp-tile--tint">
            <h3 className="lp-tile-title">Аналитик</h3>
            <p className="lp-tile-line">Пишет вам каждое утро</p>
            <p className="lp-tile-body">
              Короткий отчёт в Telegram к открытию магазина. Причина каждого заказа хранится
              вместе с заказом, а не сочиняется задним числом.
            </p>
            <ul className="lp-digest" aria-label="Что есть в утреннем отчёте">
              <li>
                <strong>Что заказано и почему</strong>
                <span>каждая заявка со своей причиной</span>
              </li>
              <li>
                <strong>Сколько денег осталось</strong>
                <span>остаток месячного бюджета</span>
              </li>
              <li>
                <strong>Что горит по сроку</strong>
                <span>партии, которые не успеют продаться</span>
              </li>
              <li>
                <strong>Что стоит уценить</strong>
                <span>и на сколько, чтобы успеть</span>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---- Proof against a real month ---- */}
      <section className="lp-section lp-proof">
        <div className="lp-proof-copy">
          <Reveal>
            <h2 className="lp-h2">Проверено на реальном августе</h2>
          </Reveal>
          <Reveal delay={60}>
            <p className="lp-section-lede">
              Магазин прислал выгрузку онлайн-заказов за июль и август: 2&nbsp;380 заказов и
              продажи каждой позиции. Прогноз, сделанный 1 августа, сверили с фактом по
              9&nbsp;076 позициям.
            </p>
          </Reveal>
          <Reveal delay={120} as="ul" className="lp-facts">
            <li>
              <span className="lp-fact-n tabular">0,87</span>
              <span className="lp-fact-l">ошибка к сезонной базе: на 13% лучше того, что дал бы прошлый год</span>
            </li>
            <li>
              <span className="lp-fact-n tabular">+34%</span>
              <span className="lp-fact-l">
                объём завышен: 2&nbsp;151 штука в прогнозе против 1&nbsp;602 проданных. Форму
                спроса модель угадывает, масштаб пока нет
              </span>
            </li>
            <li>
              <span className="lp-fact-n tabular">72%</span>
              <span className="lp-fact-l">напоминаний о повторной покупке пришли в срок, против 60% у памяти продавца</span>
            </li>
          </Reveal>
        </div>
        <div className="lp-proof-charts">
          <Reveal delay={90}>
            <Bars
              items={bases}
              max={1.1}
              format={ratio}
              reference={{ value: 1, label: "уровень базы" }}
              caption="Ошибка прогноза относительно трёх простых баз за август 2026."
            />
          </Reveal>
          <Reveal delay={150}>
            <Bars
              items={repeat}
              max={100}
              format={percent}
              caption="Доля напоминаний, попавших в ±25% цикла покупки."
            />
          </Reveal>
        </div>
      </section>

      {/* ---- Arithmetic versus the model ---- */}
      <section className="lp-section lp-section--tint">
        <Reveal>
          <h2 className="lp-h2">Числа считает арифметика. Объясняет модель.</h2>
        </Reveal>
        <Reveal delay={60}>
          <p className="lp-section-lede">
            Языковая модель не считает, она правдоподобно продолжает текст. В консультанте это
            терпимо. В заявке на 40&nbsp;000 сомони уже нет.
          </p>
        </Reveal>

        <Reveal delay={120} className="lp-ledger">
          <div className="lp-ledger-col">
            <h3>Считает код</h3>
            <ul>
              <li>Спрос, сезонность, страховой запас</li>
              <li>Точка перезаказа и целевой уровень</li>
              <li>Доходность и выбор поставщика</li>
              <li>Проверка бюджета и всех границ</li>
            </ul>
            <p className="lp-ledger-note">
              Воспроизводимо. Проверяется бэктестом. Восстанавливается через год.
            </p>
          </div>
          <div className="lp-ledger-col">
            <h3>Понимает и объясняет модель</h3>
            <ul>
              <li>Разбор запроса покупателя</li>
              <li>Чтение этикетки с фотографии</li>
              <li>Расшифровка голосового сообщения</li>
              <li>Пересказ уже посчитанного решения</li>
            </ul>
            <p className="lp-ledger-note">
              У каждого числа есть паспорт. Модель его пересказывает, а не сочиняет.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---- The frame ---- */}
      <section className="lp-section lp-safety" id="safety">
        <div className="lp-safety-head">
          <Reveal>
            <h2 className="lp-h2">Автопилот: рамка, а не свобода</h2>
          </Reveal>
          <Reveal delay={60}>
            <p className="lp-section-lede">
              Автопилот самолёта не решает, куда лететь. Он держит курс, а на границе отдаёт
              управление. Внутри рамки агент автономен, на границе останавливается и пишет вам.
            </p>
          </Reveal>
        </div>
        <Reveal delay={120} as="dl" className="lp-guards">
          {guards.map((g) => (
            <div className="lp-guard" key={g.title}>
              <dt>{g.title}</dt>
              <dd>{g.body}</dd>
            </div>
          ))}
        </Reveal>
      </section>

      <aside className="lp-quote" aria-label="Правило остановки">
        <Reveal className="lp-quote-inner">
          <p className="lp-quote-line">Тормоз легче газа.</p>
          <p className="lp-quote-body">
            «Стоп» срабатывает от первого слова любого оператора, без подтверждения. Повысить
            бюджет может только владелец, с подтверждением и записью в журнал.
          </p>
        </Reveal>
      </aside>

      {/* ---- The stores ---- */}
      <section className="lp-section lp-stores" id="stores">
        <Reveal>
          <h2 className="lp-h2">Три магазина и онлайн-витрина</h2>
        </Reveal>
        <Reveal delay={60}>
          <p className="lp-section-lede">
            Ассистент собирает корзину по остаткам онлайн-витрины hbshop.tj. Заказ можно
            забрать в любом из трёх магазинов сети, часы работы ниже.
          </p>
        </Reveal>
        <div className="lp-store-grid">
          <Reveal as="figure" className="lp-store lp-store--big">
            <Photo
              name="siema"
              alt="Магазин Hayat Beauty в торговом центре Сиема Молл: витрина с неоновой розовой рамкой"
              width={1600}
              height={900}
              sizes="(max-width: 900px) 100vw, 56vw"
            />
            <figcaption>
              <strong>Сиема Молл</strong>
              <span>с 10:00 до 22:00, ежедневно</span>
            </figcaption>
          </Reveal>
          <Reveal delay={80} as="figure" className="lp-store">
            <Photo
              name="vatan"
              alt="Магазин Hayat Beauty на улице Дехлави"
              width={1600}
              height={900}
              sizes="(max-width: 900px) 100vw, 36vw"
            />
            <figcaption>
              <strong>Ватан, ул. Х. Дехлави, 2</strong>
              <span>с 10:00 до 22:00, ежедневно</span>
            </figcaption>
          </Reveal>
          <Reveal delay={160} as="figure" className="lp-store">
            <Photo
              name="sadbarg"
              alt="Вывеска Hayat Beauty в торговом центре Садбарг"
              width={1600}
              height={900}
              sizes="(max-width: 900px) 100vw, 36vw"
            />
            <figcaption>
              <strong>ТЦ Садбарг, 2-й этаж</strong>
              <span>с 9:30 до 18:00, с понедельника по субботу</span>
            </figcaption>
          </Reveal>
        </div>
      </section>

      {/* ---- What else ---- */}
      <section className="lp-section lp-extras-wrap">
        <Reveal>
          <h2 className="lp-h2">И ещё</h2>
        </Reveal>
        <div className="lp-extras">
          {extras.map((e, i) => (
            <Reveal key={e.t} delay={i * 70} as="article" className="lp-extra">
              <h3>{e.t}</h3>
              <p>{e.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Close ---- */}
      <section className="lp-final">
        <Reveal>
          <h2 className="lp-h2">Начните с теневого режима</h2>
        </Reveal>
        <Reveal delay={70}>
          <p className="lp-section-lede">
            Подключите каталог, задайте бюджет и пороги. Две недели агент решает всё, но ничего
            не отправляет. Включите его, когда согласитесь с его решениями.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <Link href="/app" className="lp-btn lp-btn--primary lp-btn--lg">
            Открыть ассистента
          </Link>
        </Reveal>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <Mark size={24} />
          <Wordmark />
        </div>
        <address className="lp-footer-address">
          ул. Х. Дехлави, 2, Душанбе
          <br />
          <a href="tel:+992940909009">+992 94 090 90 09</a>
          <br />
          <a href="https://hbshop.tj" rel="noopener">
            hbshop.tj
          </a>
        </address>
        <p className="lp-footer-note">
          Цифры на странице получены на симуляции по реальному каталогу и на выгрузках магазина
          за июль и август 2026 года. Ассистент не ставит диагнозов и не даёт медицинских
          рекомендаций.
        </p>
      </footer>
    </main>
  );
}
