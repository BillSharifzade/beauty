import type { Metadata } from "next";
import Link from "next/link";
import { Mark, Wordmark } from "@/components/Brand";
import { CollectionCanvas } from "@/components/collection/CollectionCanvas";
import { ProductView } from "@/components/collection/ProductView";
import { Counter } from "@/components/landing/Counter";
import { LogoWall } from "@/components/landing/LogoWall";
import { NavSpy } from "@/components/landing/NavSpy";
import { Preloader } from "@/components/landing/Preloader";
import { Reveal } from "@/components/landing/Reveal";
import { Words } from "@/components/landing/Words";
import { ProductScrollSection } from "@/components/product/ProductScrollSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { ProductId } from "@/components/product/config/types";

/**
 * The landing page.
 *
 * A beauty house's site is a promise about care, and the page makes it the
 * way the products do: with precision. The hero is the collection taking
 * itself apart and putting itself back together; everything below is set
 * large and quiet, with the brand's one colour spent where it matters.
 */

const description =
  "Коллекция из пяти продуктов — крем, тинт, шампунь, тушь и карандаш. Каждая деталь на своём месте, и у каждой есть причина там находиться.";

export const metadata: Metadata = {
  title: "Velvé — косметика, собранная точно",
  description,
  openGraph: {
    title: "Velvé — косметика, собранная точно",
    description,
    locale: "ru_RU",
    type: "website",
    images: [{ url: "/brand/og.png", width: 1200, height: 630 }],
  },
};

const principles = [
  {
    n: "01",
    t: "Формула",
    d: "Каждый ингредиент решает задачу. Мы не добавляем отдушки ради запаха и цвет ради цвета.",
  },
  {
    n: "02",
    t: "Форма",
    d: "Флакон, дозатор и крышка спроектированы вместе. Ничего не течёт, не липнет и не ломается в сумке.",
  },
  {
    n: "03",
    t: "Точность",
    d: "Дозировка активов измерена и напечатана на этикетке. «Примерно» — не единица измерения.",
  },
];

const numbers = [
  { n: 0, d: 0, l: "сульфатов, парабенов и минерального масла" },
  { n: 5.5, d: 1, l: "pH шампуня — как у здоровой кожи головы" },
  { n: 12, d: 0, l: "активных компонентов во всей коллекции" },
  { n: 32, d: 0, l: "детали в пяти продуктах, каждая на своём месте" },
];

const products: {
  id: ProductId;
  index: string;
  name: string;
  latin: string;
  volume: string;
  line: string;
  actives: string[];
  shades: string[];
}[] = [
  {
    id: "cream",
    index: "01",
    name: "Крем",
    latin: "Hydra Cream",
    volume: "50 ml",
    line: "Сорок восемь часов увлажнения. Плотная текстура, которая впитывается и не оставляет плёнки.",
    actives: ["Ниацинамид 5%", "Церамиды NP", "Сквалан"],
    shades: [],
  },
  {
    id: "tint",
    index: "02",
    name: "Тинт",
    latin: "Lip Tint",
    volume: "6 ml",
    line: "Тонкий слой цвета, который держится весь день и не сушит губы.",
    actives: ["Масло ши", "Гиалуронат", "Витамин E"],
    shades: ["#d4234f", "#c2185b", "#e8677f", "#8e2436"],
  },
  {
    id: "shampoo",
    index: "03",
    name: "Шампунь",
    latin: "Shampoo",
    volume: "300 ml",
    line: "Мягкое очищение при pH 5,5: без сульфатов, с пантенолом и инулином для кожи головы.",
    actives: ["Пантенол", "Инулин", "Коко-глюкозид"],
    shades: [],
  },
  {
    id: "mascara",
    index: "04",
    name: "Тушь",
    latin: "Volume Mascara",
    volume: "9 ml",
    line: "Объём и разделение с первого слоя, без комков и осыпания к вечеру.",
    actives: ["Пчелиный воск", "Пантенол", "Кератин"],
    shades: ["#0d0d10"],
  },
  {
    id: "pencil",
    index: "05",
    name: "Карандаш",
    latin: "Eye Pencil",
    volume: "1,2 g",
    line: "Мягкий грифель и чёткая линия одним движением. Держится двенадцать часов.",
    actives: ["Масло жожоба", "Воск карнаубы"],
    shades: ["#0d0d10", "#3b2a2a", "#3d3a7a"],
  },
];

const formula = {
  yes: [
    ["Ниацинамид, церамиды и сквалан", "для барьера кожи"],
    ["Пантенол и инулин", "для волос и кожи головы"],
    ["Масла ши и жожоба", "для губ и век"],
    ["Растительные воски", "для стойкости"],
  ],
  no: [
    ["Сульфатов SLS и SLES", "очищение мягче, кожа спокойнее"],
    ["Парабенов", "и любых формальдегид-релизеров"],
    ["Минерального масла и силиконов", "ничего, что просто лежит сверху"],
    ["Тестов на животных", "ни на одном этапе"],
  ],
};

export default function Landing() {
  return (
    <main className="lp" id="main">
      <Preloader />
      <a className="lp-skip" href="#collection">
        К содержанию
      </a>

      <header className="lp-nav">
        <Link href="/" className="lp-brand" aria-label="Velvé, на главную">
          <Mark size={30} title="" />
          <Wordmark />
        </Link>
        <nav className="lp-nav-links" aria-label="Разделы страницы">
          <a href="#collection">Коллекция</a>
          <a href="#formula">Формула</a>
          <a href="#partners">Партнёры</a>
          <ThemeToggle compact />
          <a href="#collection" className="lp-btn lp-btn--primary lp-btn--sm">
            Смотреть коллекцию
          </a>
        </nav>
        <NavSpy ids={["collection", "formula", "partners"]} />
      </header>

      {/* ---- The hero: the collection assembles itself ---- */}
      <ProductScrollSection />

      {/* ---- Manifesto ---- */}
      <section className="lp-section lp-manifesto" id="about">
        <Reveal>
          <p className="lp-eyebrow">Манифест</p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="lp-display">
            <Words text="Мы не добавляем ничего," />{" "}
            <span className="lp-accent">
              <Words text="что не можем объяснить." from={4} />
            </span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="lp-section-lede lp-manifesto-lede">
            Коллекция Velvé — пять продуктов, собранных из тридцати двух деталей. У каждой детали
            есть причина быть там, где она есть. У каждого ингредиента — тоже.
          </p>
        </Reveal>
        <Reveal delay={180} as="ul" className="lp-principles">
          {principles.map((p) => (
            <li className="lp-principle" key={p.n}>
              <span className="lp-principle-n">{p.n}</span>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </li>
          ))}
        </Reveal>
      </section>

      {/* ---- Numbers ---- */}
      <section className="lp-numbers" aria-label="Коллекция в цифрах">
        <Reveal as="dl" className="lp-numbers-grid">
          {numbers.map((s) => (
            <div className="lp-number" key={s.l}>
              <dt className="lp-number-l">{s.l}</dt>
              <dd className="lp-number-n">
                <Counter value={s.n} decimals={s.d} />
              </dd>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ---- The wordmark, going by ---- */}
      <div className="lp-ticker" aria-hidden="true">
        <div className="lp-ticker-track">
          {[0, 1].map((copy) => (
            <span className="lp-ticker-run" key={copy}>
              Velvé <em>·</em> Красота, собранная точно <em>·</em> Velvé <em>·</em> Пять формул, одна точность{" "}
              <em>·</em>{" "}
            </span>
          ))}
        </div>
      </div>

      {/* ---- Collection ---- */}
      <section className="lp-section lp-collection" id="collection">
        <div className="lp-section-head">
          <Reveal>
            <p className="lp-eyebrow">Коллекция 2026</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="lp-h2">
              <Words text="Пять продуктов. Одна система." />
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lp-section-lede">
              Уход и макияж, которые не спорят друг с другом: один pH, одни принципы состава, одна
              полка в ванной. Наведите на продукт, и он раскроется.
            </p>
          </Reveal>
        </div>

        <ol className="lp-products">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={i * 60} as="li" className={`lp-product lp-product--${p.id}`}>
              <ProductView id={p.id} index={p.index} />
              <div className="lp-product-body">
                <span className="lp-product-index">{p.index}</span>
                <h3 className="lp-product-name">
                  {p.name} <span className="lp-product-latin">{p.latin}</span>
                </h3>
                <p className="lp-product-line">{p.line}</p>
                <ul className="lp-product-actives" aria-label="Активные компоненты">
                  {p.actives.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
                <div className="lp-product-meta">
                  <span className="tabular">{p.volume}</span>
                  {p.shades.length > 0 && (
                    <span className="lp-shades" aria-label={`Оттенков: ${p.shades.length}`}>
                      {p.shades.map((s) => (
                        <span className="lp-shade" key={s} style={{ background: s }} />
                      ))}
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---- Formula ---- */}
      <section className="lp-section lp-section--tint" id="formula">
        <div className="lp-section-head">
          <Reveal>
            <p className="lp-eyebrow">Формула</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="lp-h2">
              <Words text="Что внутри. И чего нет." />
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lp-section-lede">
              Состав каждого продукта умещается на его этикетке крупным шрифтом. Это не
              ограничение, это правило.
            </p>
          </Reveal>
        </div>

        <div className="lp-formula">
          <Reveal className="lp-blob" aria-hidden="true">
            <span className="lp-blob-a" />
            <span className="lp-blob-b" />
            <span className="lp-blob-c" />
            <span className="lp-blob-label">pH 5,5</span>
          </Reveal>
          <Reveal delay={160} className="lp-ledger">
          <div className="lp-ledger-col">
            <h3>Есть</h3>
            <ul>
              {formula.yes.map(([a, b]) => (
                <li key={a}>
                  <strong>{a}</strong> <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-ledger-col lp-ledger-col--no">
            <h3>Нет</h3>
            <ul>
              {formula.no.map(([a, b]) => (
                <li key={a}>
                  <strong>{a}</strong> <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          </Reveal>
        </div>
      </section>

      {/* ---- The one full-bleed block of colour ---- */}
      <aside className="lp-quote" aria-label="Принцип">
        <Reveal className="lp-quote-inner">
          <p className="lp-quote-line">
            <Words text="Меньше, но точнее." />
          </p>
          <p className="lp-quote-body">
            В каждом продукте ровно столько компонентов, сколько нужно, чтобы он работал. Ни
            одного — ради длинного списка на упаковке.
          </p>
        </Reveal>
      </aside>

      {/* ---- Partners ---- */}
      <section className="lp-partners" id="partners" aria-labelledby="partners-title">
        <div className="lp-partners-head">
          <Reveal>
            <p className="lp-eyebrow">Партнёры</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="lp-h2" id="partners-title">
              <Words text="В одной витрине с брендами, которым доверяют" />
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lp-section-lede">
              От корейского ухода до французской аптеки: коллекция Velvé стоит рядом с теми, кого
              выбирают за состав, а не за упаковку.
            </p>
          </Reveal>
        </div>
        <LogoWall />
      </section>

      {/* ---- Close ---- */}
      <section className="lp-final">
        <Reveal>
          <p className="lp-eyebrow">Осень 2026</p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="lp-display">
            <Words text="Увидеть вживую." />
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="lp-section-lede">
            Коллекция выходит осенью 2026 года. Партнёрам и дистрибьюторам мы показываем её
            первыми.
          </p>
        </Reveal>
        <Reveal delay={180} className="lp-cta-row">
          <a href="mailto:hello@velve.example" className="lp-btn lp-btn--primary lp-btn--lg">
            Написать нам
          </a>
          <a href="#hero" className="lp-btn lp-btn--ghost lp-btn--lg">
            Смотреть ещё раз
          </a>
        </Reveal>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <Mark size={24} title="" />
          <Wordmark />
          <span className="lp-footer-tagline">Косметика, собранная точно.</span>
        </div>
        <nav className="lp-footer-links" aria-label="Разделы">
          <a href="#collection">Коллекция</a>
          <a href="#formula">Формула</a>
          <a href="#partners">Партнёры</a>
        </nav>
        <p className="lp-footer-note">
          © 2026 Velvé. Сайт-презентация: продукты и составы носят демонстрационный характер.
        </p>
      </footer>

      <CollectionCanvas />
    </main>
  );
}
