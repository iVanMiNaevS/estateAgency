/**
 * Наполнение базы демо-данными парка развлечений.
 *
 * Запуск:  node scripts/seed.js
 *
 * Скрипт идемпотентен: парк-таблицы очищаются и заполняются заново,
 * существующие пользователи и отзывы не трогаются.
 *
 * Данные пишутся напрямую в SQLite, потому что lifecycles Strapi при
 * этом не срабатывают. Все вычисляемые поля (seats_taken, status,
 * total_price) проставляются здесь же — по тем же правилам, что и в
 * lifecycles в src/api.
 */

const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const DATA = require('./seed-data');

const DB_PATH = path.join(__dirname, '..', '.tmp', 'data.db');

/* ------------------------------------------------------------------ */
/*  Утилиты                                                            */
/* ------------------------------------------------------------------ */

const now = () => Date.now();

/** Strapi 5 хранит document_id как случайную строку. */
const documentId = () => crypto.randomUUID();

/** Дата в формате YYYY-MM-DD со сдвигом в днях от сегодня. */
const isoDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

/** Время в формате HH:MM. */
const isoTime = (hours, minutes = 0) =>
  `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

const log = (msg) => console.log(msg);

/* ------------------------------------------------------------------ */
/*  Подключение                                                        */
/* ------------------------------------------------------------------ */

if (!require('fs').existsSync(DB_PATH)) {
  console.error(`База не найдена: ${DB_PATH}\nСначала запустите Strapi хотя бы один раз.`);
  process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

/* ------------------------------------------------------------------ */
/*  Проверка, что схема синхронизирована                                */
/* ------------------------------------------------------------------ */

const tables = db
  .prepare("select name from sqlite_master where type = 'table'")
  .all()
  .map((r) => r.name);

const REQUIRED = [
  'attractions',
  'sessions',
  'bookings',
  'ticket_prices',
  'news_items',
  'pages',
  'main_screens',
  'reviews',
  'user_requests',
  'up_users',
  'bookings_user_lnk',
  'bookings_session_lnk',
];

const missing = REQUIRED.filter((t) => !tables.includes(t));
if (missing.length > 0) {
  console.error('В базе нет таблиц: ' + missing.join(', '));
  console.error('Запустите Strapi, чтобы схема синхронизировалась, и повторите.');
  process.exit(1);
}

log('Схема на месте, заполняю данные…');

/* ------------------------------------------------------------------ */
/*  Очистка (парк-таблицы)                                             */
/* ------------------------------------------------------------------ */

const TABLES_TO_CLEAR = [
  'bookings_user_lnk',
  'bookings_session_lnk',
  'sessions_attraction_lnk',
  'components_main_screen_recomended_5c93f_attractions_lnk',
  'components_main_screen_reviews_sections_reviews_lnk',
  'attractions_cmps',
  'sessions',
  'bookings',
  'ticket_prices_cmps',
  'ticket_prices',
  'bookings_tariff_lnk',
  'gallery_albums_items_lnk',
  'gallery_items',
  'gallery_albums',
  'news_items_cmps',
  'news_items',
  'pages_cmps',
  'pages',
  'user_requests',
  'components_attraction_attraction_options',
  'components_attraction_attraction_restrictions',
  'components_ticket_price_price_includes',
  'components_page_page_blocks_cmps',
  'components_page_page_blocks',
  'components_page_page_block_items',
  'components_seo_seos',
  'components_faq_section_faq_sections_cmps',
  'components_faq_section_faq_sections',
  'components_faq_section_questions',
  'components_main_screen_advantage_section_advantages',
  'components_main_screen_advantage_sections_cmps',
  'components_main_screen_advantage_sections',
  'components_main_screen_news_sections',
  'components_main_screen_hero_sections',
  'components_main_screen_recomended_sections',
  'components_main_screen_reviews_sections',
  'attractions',
];

db.transaction(() => {
  for (const table of TABLES_TO_CLEAR) {
    if (tables.includes(table)) db.prepare(`delete from ${table}`).run();
  }
})();

log('  очищено');

/* ------------------------------------------------------------------ */
/*  Пользователи                                                       */
/* ------------------------------------------------------------------ */

/**
 * Демо-пользователи. Пока создаются только если их ещё нет,
 * чтобы не затереть существующие учётные записи.
 */
const DEMO_USERS = [
  { username: 'anna', email: 'anna@park.ru', name: 'Анна Кузнецова', lastName: 'Сергеевна', phone: '+7 (900) 111-22-33', city: 'Рязань', birthDate: '1990-04-12', password: 'Park2026!' },
  { username: 'sergey', email: 'sergey@park.ru', name: 'Сергей Мельников', lastName: 'Петрович', phone: '+7 (903) 444-55-66', city: 'Рязань', birthDate: '1985-09-30', password: 'Park2026!' },
  { username: 'marina', email: 'marina@park.ru', name: 'Марина Орлова', lastName: 'Игоревна', phone: '+7 (926) 777-88-99', city: 'Рязань', birthDate: '1995-12-01', password: 'Park2026!' },
];

const insertUser = db.prepare(`
  insert into up_users
    (document_id, username, email, provider, password, confirmed, blocked,
     created_at, updated_at, published_at, city, name, phone, last_name, birth_date)
  values
    (@document_id, @username, @email, 'local', @password, 1, 0,
     @created_at, @updated_at, @published_at, @city, @name, @phone, @last_name, @birth_date)
`);

const findUserByEmail = db.prepare('select id from up_users where email = ?');
const createdUsers = [];

db.transaction(() => {
  for (const user of DEMO_USERS) {
    const existing = findUserByEmail.get(user.email);
    if (existing) {
      createdUsers.push(existing.id);
      continue;
    }
    const ts = now();
    const info = insertUser.run({
      document_id: documentId(),
      username: user.username,
      email: user.email,
      password: bcrypt.hashSync(user.password, 10),
      created_at: ts,
      updated_at: ts,
      published_at: ts,
      city: user.city,
      name: user.name,
      phone: user.phone,
      last_name: user.lastName,
      birth_date: user.birthDate,
    });
    createdUsers.push(info.lastInsertRowid);
  }
})();

// Роль «Authenticated» (type = 'authenticated')
const authenticatedRole = db
  .prepare("select id from up_roles where type = 'authenticated'")
  .get();

if (authenticatedRole) {
  const linkUserRole = db.prepare(
    'insert or ignore into up_users_role_lnk (user_id, role_id, user_ord) values (?, ?, ?)'
  );
  db.transaction(() => {
    for (const userId of createdUsers) {
      linkUserRole.run(userId, authenticatedRole.id, userId);
    }
  })();
}

log(`  пользователей готово: ${createdUsers.length}`);

/* ------------------------------------------------------------------ */
/*  Аттракционы                                                        */
/* ------------------------------------------------------------------ */

const insertAttraction = db.prepare(`
  insert into attractions
    (document_id, title, slug, type, short_fact, description, duration_minutes,
     base_price, age_min, age_max, height_min_cm, height_max_cm,
     is_active, sort_order, created_at, updated_at, published_at)
  values
    (@document_id, @title, @slug, @type, @short_fact, @description, @duration_minutes,
     @base_price, @age_min, @age_max, @height_min_cm, @height_max_cm,
     1, @sort_order, @created_at, @updated_at, @published_at)
`);

const insertRestriction = db.prepare(`
  insert into components_attraction_attraction_restrictions
    (title, text, is_critical)
  values (@title, @text, @is_critical)
`);

const insertOption = db.prepare(`
  insert into components_attraction_attraction_options
    (label, value)
  values (@label, @value)
`);

const linkCmp = db.prepare(`
  insert into attractions_cmps (entity_id, cmp_id, component_type, field, "order")
  values (?, ?, ?, ?, ?)
`);

/** slug в латинице — для читаемых URL. */
const slugify = (title) => {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return title
    .toLowerCase()
    .split('')
    .map((ch) => (map[ch] !== undefined ? map[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

const attractionIds = [];

const seedAttractions = () => {
  db.transaction(() => {
    for (const item of DATA.ATTRACTIONS) {
      const ts = now();
      const slug = slugify(item.title);

      const info = insertAttraction.run({
        document_id: documentId(),
        title: item.title,
        slug: slug,
        type: item.type,
        short_fact: item.shortFact,
        description: item.description,
        duration_minutes: item.durationMinutes,
        base_price: item.basePrice,
        age_min: item.ageMin,
        age_max: item.ageMax,
        height_min_cm: item.heightMinCm,
        height_max_cm: item.heightMaxCm,
        sort_order: item.sortOrder,
        created_at: ts,
        updated_at: ts,
        published_at: ts,
      });

      const attractionId = info.lastInsertRowid;
      attractionIds.push({ id: attractionId, title: item.title, type: item.type, slug: slug,
                           durationMinutes: item.durationMinutes, basePrice: item.basePrice });

      (item.restrictions || []).forEach((restriction, index) => {
        const cmp = insertRestriction.run({
          title: restriction.title,
          text: restriction.text,
          is_critical: restriction.isCritical ? 1 : 0,
        });
        linkCmp.run(attractionId, cmp.lastInsertRowid, 'attraction.attraction-restriction', 'restrictions', index);
      });

      const options = [
        { label: 'Длительность', value: item.durationMinutes + ' мин' },
        { label: 'Стоимость', value: item.basePrice > 0 ? item.basePrice + ' руб' : 'Бесплатно' },
        { label: 'Возраст', value: item.ageMax ? item.ageMin + '-' + item.ageMax + ' лет' : 'от ' + item.ageMin + ' лет' },
      ];
      if (item.heightMinCm) {
        options.push({ label: 'Рост', value: item.heightMinCm + '-' + item.heightMaxCm + ' см' });
      }

      options.forEach((option, index) => {
        const cmp = insertOption.run({ label: option.label, value: option.value });
        linkCmp.run(attractionId, cmp.lastInsertRowid, 'attraction.attraction-option', 'options', index);
      });
    }
  })();
};

seedAttractions();

log(`  аттракционов: ${attractionIds.length}`);

/* ------------------------------------------------------------------ */
/*  Тарифы                                                             */
/* ------------------------------------------------------------------ */

const insertPrice = db.prepare(`
  insert into ticket_prices
    (document_id, title, category, description, price, old_price,
     duration_minutes, adult_price, child_price, cancel_policy, is_popular,
     sort_order, created_at, updated_at, published_at)
  values
    (@document_id, @title, @category, @description, @price, @old_price,
     @duration_minutes, @adult_price, @child_price, @cancel_policy, @is_popular,
     @sort_order, @created_at, @updated_at, @published_at)
`);

const insertInclude = db.prepare(`
  insert into components_ticket_price_price_includes
    (text)
  values (@text)
`);

let priceCount = 0;

/** id и цены тарифов — на них ссылаются бронирования. */
const ticketPrices = [];

const seedPrices = () => {
  db.transaction(() => {
    for (const item of DATA.TICKET_PRICES) {
      const ts = now();
      const info = insertPrice.run({
        document_id: documentId(),
        title: item.title,
        category: item.category,
        description: item.description,
        price: item.price,
        old_price: item.oldPrice || null,
        duration_minutes: item.durationMinutes || null,
        adult_price: item.adultPrice || null,
        child_price: item.childPrice || null,
        cancel_policy: item.cancelPolicy || null,
        is_popular: item.isPopular ? 1 : 0,
        sort_order: item.sortOrder,
        created_at: ts,
        updated_at: ts,
        published_at: ts,
      });

      (item.includes || []).forEach((include, index) => {
        const cmp = insertInclude.run({ text: include.text });
        db.prepare(
          'insert into ticket_prices_cmps (entity_id, cmp_id, component_type, field, "order") values (?, ?, ?, ?, ?)'
        ).run(info.lastInsertRowid, cmp.lastInsertRowid, 'ticket-price.price-include', 'includes', index);
      });

      ticketPrices.push({
        id: info.lastInsertRowid,
        price: item.price,
        adultPrice: item.adultPrice || null,
        childPrice: item.childPrice || null,
      });
      priceCount += 1;
    }
  })();
};

seedPrices();

log(`  тарифов: ${priceCount}`);

/* ------------------------------------------------------------------ */
/*  Сеансы                                                             */
/* ------------------------------------------------------------------ */

/** Расписание по типам аттракционов: часы начала и вместимость. */
const SCHEDULE = {
  extreme: { hours: [11, 13, 15, 17, 19, 21], capacity: 6, duration: 3 },
  family: { hours: [10, 12, 14, 16, 18, 20], capacity: 24, duration: 15 },
  child: { hours: [10, 12, 14, 16, 18], capacity: 20, duration: 60 },
};

const insertSession = db.prepare(`
  insert into sessions
    (document_id, date, start_time, duration_minutes, capacity, seats_taken,
     price, status, created_at, updated_at, published_at)
  values
    (@document_id, @date, @start_time, @duration_minutes, @capacity, 0,
     @price, 'open', @created_at, @updated_at, @published_at)
`);

const linkSessionAttraction = db.prepare(
  'insert into sessions_attraction_lnk (session_id, attraction_id, session_ord) values (?, ?, 1)'
);

const sessionIds = [];

const seedSessions = () => {
  db.transaction(() => {
    for (let dayOffset = 0; dayOffset <= 13; dayOffset += 1) {
      const date = isoDate(dayOffset);

      for (const attraction of attractionIds) {
        const plan = SCHEDULE[attraction.type];
        if (!plan) continue;

        const weekday = new Date(date + 'T00:00:00').getDay();
        const hours = weekday === 0 ? plan.hours.filter((h) => h < 20) : plan.hours;

        for (const hour of hours) {
          const ts = now();
          const info = insertSession.run({
            document_id: documentId(),
            date: date,
            start_time: isoTime(hour),
            duration_minutes: attraction.durationMinutes || plan.duration,
            capacity: plan.capacity,
            price: attraction.basePrice,
            created_at: ts,
            updated_at: ts,
            published_at: ts,
          });
          linkSessionAttraction.run(info.lastInsertRowid, attraction.id);
          sessionIds.push({
            id: info.lastInsertRowid,
            date: date,
            capacity: plan.capacity,
            price: attraction.basePrice,
            type: attraction.type,
            startTime: hour,
          });
        }
      }
    }
  })();
};

seedSessions();

log(`  сеансов: ${sessionIds.length}`);

/* ------------------------------------------------------------------ */
/*  Бронирования                                                       */
/* ------------------------------------------------------------------ */

/**
 * Создаём брони так, чтобы наглядно закрыть все статусы из ТЗ:
 * pending / confirmed / completed / cancelled / rejected.
 * После вставки пересчитываем seats_taken и статус сеанса —
 * теми же правилами, что и в session/lifecycles.ts.
 */
const STATUSES = ['pending', 'confirmed', 'paid', 'completed', 'cancelled', 'rejected'];
/** Статусы, которые занимают места в сеансе. */
const OCCUPYING = ['pending', 'confirmed', 'paid'];

const insertBooking = db.prepare(`
  insert into bookings
    (document_id, guests_count, adults_count, children_count, total_price, status,
     contact_name, contact_phone, wishes, comment, cancelled_at,
     created_at, updated_at, published_at)
  values
    (@document_id, @guests_count, @adults_count, @children_count, @total_price, @status,
     @contact_name, @contact_phone, @wishes, @comment, @cancelled_at,
     @created_at, @updated_at, @published_at)
`);

/** Тариф хранится в отдельной таблице связей — как это делает Strapi. */
const linkBookingTariff = db.prepare(
  'insert into bookings_tariff_lnk (booking_id, tariff_id, booking_ord) values (?, ?, 1)'
);

const linkBookingUser = db.prepare(
  'insert into bookings_user_lnk (booking_id, user_id, booking_ord) values (?, ?, 1)'
);
const linkBookingSession = db.prepare(
  'insert into bookings_session_lnk (booking_id, session_id, booking_ord) values (?, ?, 1)'
);

const COMMENTS = {
  cancelled: 'Гость отменил бронь за день до сеанса.',
  rejected: 'Отказано: нет свободных мест на это время.',
};

const WISHES = [
  'Хотим место у окна в колесе обозрения.',
  'Едем с двумя детьми 6 и 9 лет, нужна помощь с шкафчиком.',
  'Пожелаем припарковаться ближе к входу.',
  'Дети боятся высоты — если можно, подберите маршрут спокойнее.',
  'Будем отмечать день рождения, есть ли где оставить торт.',
  'Нужна помощь сотрудника для гостя на инвалидной коляске.',
  'Пожалуйста, напомните про камеру хранения вещей.',
  null,
];

let bookingCount = 0;

db.transaction(() => {
  let userIndex = 0;

  for (let i = 0; i < 48 && i < sessionIds.length; i += 1) {
    const session = sessionIds[i * 2 % sessionIds.length];
    const userId = createdUsers[userIndex % createdUsers.length];
    userIndex += 1;

    const status = STATUSES[i % STATUSES.length];
    // Состав гостей: от 1 до 4 человек, взрослые и дети чередуются.
    const guestsCount = 1 + ((i * 3) % Math.min(4, session.capacity));
    const adultsCount = i % 3 === 2 ? 0 : Math.min(guestsCount, 1 + (i % 2));
    const childrenCount = guestsCount - adultsCount;

    // Не более одной брони на пользователя в одном сеансе.
    const alreadyBooked = db
      .prepare('select 1 from bookings_session_lnk where session_id = ? limit 1')
      .get(session.id);
    if (alreadyBooked) continue;

    // Тариф подбираем так, чтобы тарифы с ценой ребёнка тоже использовались.
    const tariff = ticketPrices[i % ticketPrices.length];

    // Считаем так же, как lifecycles: если у тарифа есть раздельные цены —
    // по ним, иначе по цене места в сеансе.
    const usesSplit = (tariff.adultPrice || 0) > 0 || (tariff.childPrice || 0) > 0;
    const pricePerAdult = usesSplit ? tariff.adultPrice || 0 : tariff.price || session.price;
    const pricePerChild = usesSplit ? tariff.childPrice || 0 : tariff.price || session.price;
    const totalPrice = adultsCount * pricePerAdult + childrenCount * pricePerChild;

    const ts = now();
    const info = insertBooking.run({
      document_id: documentId(),
      guests_count: guestsCount,
      adults_count: adultsCount,
      children_count: childrenCount,
      total_price: totalPrice,
      status,
      contact_name: DATA.PARK.name,
      contact_phone: DATA.PARK.phone,
      wishes: WISHES[i % WISHES.length],
      comment: COMMENTS[status] || null,
      cancelled_at: status === 'cancelled' ? ts : null,
      created_at: ts,
      updated_at: ts,
      published_at: ts,
    });

    linkBookingUser.run(info.lastInsertRowid, userId);
    linkBookingSession.run(info.lastInsertRowid, session.id);
    if (tariff) linkBookingTariff.run(info.lastInsertRowid, tariff.id);
    bookingCount += 1;
  }
})();

/**
 * Пересчёт seats_taken и статуса сеанса — то же, что делает
 * session service recalcSeats. Вызывается после массовой вставки,
 * потому что lifecycles при прямой записи в SQLite не работают.
 */
const sessionsForRecalc = db
  .prepare('select distinct session_id from bookings_session_lnk')
  .all();

db.transaction(() => {
  const sumSeats = db.prepare(`
    select sum(b.guests_count) as seats
    from bookings b
    join bookings_session_lnk lnk on lnk.booking_id = b.id
    where lnk.session_id = ? and b.status in ('pending', 'confirmed', 'paid')
  `);

  const updateSession = db.prepare(
    'update sessions set seats_taken = ?, status = ? where id = ?'
  );

  for (const { session_id: sessionId } of sessionsForRecalc) {
    const session = db.prepare('select capacity, status from sessions where id = ?').get(sessionId);
    if (!session) continue;

    const seats = sumSeats.get(sessionId).seats || 0;
    const status = session.status === 'cancelled' ? 'cancelled' : seats >= session.capacity ? 'full' : 'open';
    updateSession.run(seats, status, sessionId);
  }
})();

log(`  бронирований: ${bookingCount}`);



/* ------------------------------------------------------------------ */
/*  Новости                                                            */
/* ------------------------------------------------------------------ */

const insertNews = db.prepare(`
  insert into news_items
    (document_id, title, slug, excerpt, content, event_date, is_pinned,
     created_at, updated_at, published_at)
  values
    (@document_id, @title, @slug, @excerpt, @content, @event_date, @is_pinned,
     @created_at, @updated_at, @published_at)
`);

let newsCount = 0;

db.transaction(() => {
  for (const item of DATA.NEWS) {
    const ts = now();
    insertNews.run({
      document_id: documentId(),
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      event_date: item.eventDateOffsetDays === undefined ? null : isoDate(item.eventDateOffsetDays),
      is_pinned: item.isPinned ? 1 : 0,
      created_at: ts,
      updated_at: ts,
      published_at: ts,
    });
    newsCount += 1;
  }
})();

log(`  новостей: ${newsCount}`);

/* ------------------------------------------------------------------ */
/*  Страницы + SEO + блоки + FAQ                                       */
/* ------------------------------------------------------------------ */

const insertPage = db.prepare(`
  insert into pages
    (document_id, title, slug, subtitle, content, created_at, updated_at, published_at)
  values
    (@document_id, @title, @slug, @subtitle, @content, @created_at, @updated_at, @published_at)
`);

const linkPageCmp = db.prepare(
  'insert into pages_cmps (entity_id, cmp_id, component_type, field, "order") values (?, ?, ?, ?, ?)'
);

/**
 * Вложенные компоненты (items внутри block) ссылаются на свой блок,
 * а не на страницу: для них Strapi создаёт отдельную таблицу связей.
 */
const linkBlockCmp = db.prepare(
  'insert into components_page_page_blocks_cmps (entity_id, cmp_id, component_type, field, "order") values (?, ?, ?, ?, ?)'
);

const insertBlock = db.prepare(`
  insert into components_page_page_blocks
    (title, text, layout)
  values (@title, @text, @layout)
`);

const insertBlockItem = db.prepare(`
  insert into components_page_page_block_items
    (title, text)
  values (@title, @text)
`);

const insertSeo = db.prepare(`
  insert into components_seo_seos
    (title, description)
  values (@title, @description)
`);

const insertFaqSection = db.prepare(`
  insert into components_faq_section_faq_sections
    (title, description)
  values (@title, @description)
`);

const insertQuestion = db.prepare(`
  insert into components_faq_section_questions
    (title, description, slug)
  values (@title, @description, @slug)
`);

const linkFaqSectionCmp = db.prepare(
  'insert into components_faq_section_faq_sections_cmps (entity_id, cmp_id, component_type, field, "order") values (?, ?, ?, ?, ?)'
);

const FAQ = {
  title: 'Частые вопросы',
  description: 'Ответы на популярные вопросы о посещении парка',
  questions: [
    { title: 'Нужно ли бронировать заранее?', description: 'Да, онлайн-запись удобнее: время сеанса фиксируется, и вы не ждёте очередь. Купить билет в кассе тоже можно — но тогда сеанс не гарантирован.' },
    { title: 'Можно ли прийти с детьми?', description: 'Да, для семей с детьми 5–14 лет есть детские аттракционы, лодочная дорожка и площадка «Остров сокровищ». Детям до 5 лет вход бесплатный.' },
    { title: 'Есть ли ограничения по росту?', description: 'Да, и они указаны в карточке каждого аттракциона. Например, на «Свободное падение» нужен рост от 140 см, на «Экстрим-Пик» — от 130 см.' },
    { title: 'Что взять с собой?', description: 'Сменную обувь и документы для детей. Наличные, карта и СБП принимаются в кассе. Запрещено брать острые предметы и стеклянную посуду.' },
    { title: 'Можно ли отменить бронирование?', description: 'Да, в личном кабинете, пока статус брони «ожидает» или «подтверждено». Возврат 100% при отмене не позднее чем за 2 часа до сеанса.' },
    { title: 'Что делать, если стало плохо?', description: 'Обратитесь к сотруднику в красной униформе или на стойку фуд-корта. На территории дежурит медицинский пункт с открытия парка.' },
  ],
};

const PAGE_SEO = {
  about: ['Парк Чудес в Рязани', 'Семейный парк с 14 аттракционами для любого возраста. История, миссия и правила посещения.'],
  rules: ['Правила посещения — Парк Чудес', 'Ограничения по возрасту, росту и здоровью. Что можно и нельзя брать на территорию парка.'],
  prices: ['Цены на билеты — Парк Чудес', 'Стоимость взрослых, детских, семейных и групповых билетов, дополнительные услуги и льготы.'],
  contacts: ['Контакты — Парк Чудес', 'Адрес, телефон, часы работы и схема проезда парка развлечений в Рязани.'],
  privacy: ['Политика конфиденциальности — Парк Чудес', 'Порядок обработки персональных данных посетителей в соответствии с 152-ФЗ.'],
};

let pageCount = 0;

db.transaction(() => {
  for (const page of DATA.PAGES) {
    const ts = now();
    const info = insertPage.run({
      document_id: documentId(),
      title: page.title,
      slug: page.slug,
      subtitle: page.subtitle || null,
      content: page.content,
      created_at: ts,
      updated_at: ts,
      published_at: ts,
    });

    const pageId = info.lastInsertRowid;

    (page.blocks || []).forEach((block, blockIndex) => {
      const blockCmp = insertBlock.run({
        title: block.title || null,
        text: block.text || null,
        layout: block.layout || 'text',
      });
      const blockId = blockCmp.lastInsertRowid;
      linkPageCmp.run(pageId, blockId, 'page.page-block', 'blocks', blockIndex);

      (block.items || []).forEach((item, itemIndex) => {
        const itemCmp = insertBlockItem.run({ title: item.title, text: item.text });
        linkBlockCmp.run(blockId, itemCmp.lastInsertRowid, 'page.page-block-item', 'items', itemIndex);
      });
    });

    // SEO
    const seo = PAGE_SEO[page.slug];
    if (seo) {
      const seoCmp = insertSeo.run({ title: seo[0], description: seo[1] });
      linkPageCmp.run(pageId, seoCmp.lastInsertRowid, 'seo.seo', 'seo', null);
    }

    // FAQ — только на странице «О парке»
    if (page.slug === 'about') {
      const faqCmp = insertFaqSection.run({ title: FAQ.title, description: FAQ.description });
      const faqId = faqCmp.lastInsertRowid;
      linkPageCmp.run(pageId, faqId, 'faq-section.faq-section', 'faq', null);

      FAQ.questions.forEach((question, index) => {
        const qCmp = insertQuestion.run({
          title: question.title,
          description: question.description,
          slug: '#',
        });
        linkFaqSectionCmp.run(faqId, qCmp.lastInsertRowid, 'faq-section.question', 'questions', index);
      });
    }

    pageCount += 1;
  }
})();

log(`  страниц: ${pageCount}`);

/* ------------------------------------------------------------------ */
/*  Главная страница (singleType)                                       */
/* ------------------------------------------------------------------ */

const mainScreenCmp = db.prepare(
  'insert into main_screens_cmps (entity_id, cmp_id, component_type, field, "order") values (?, ?, ?, ?, ?)'
);

const insertHeroSection = db.prepare(`
  insert into components_main_screen_hero_sections
    (title, description)
  values (@title, @description)
`);

const insertAdvantageSection = db.prepare(`
  insert into components_main_screen_advantage_sections
    (title)
  values (@title)
`);

const insertAdvantage = db.prepare(`
  insert into components_main_screen_advantage_section_advantages
    (title, text)
  values (@title, @text)
`);

const insertRecomended = db.prepare(`
  insert into components_main_screen_recomended_sections
    (title, description)
  values (@title, @description)
`);

const insertNewsSection = db.prepare(`
  insert into components_main_screen_news_sections
    (title, description)
  values (@title, @description)
`);

const linkRecomendedAttraction = db.prepare(
  'insert into components_main_screen_recomended_5c93f_attractions_lnk (recomended_section_id, attraction_id, attraction_ord) values (?, ?, ?)'
);

const insertReviewsSection = db.prepare(`
  insert into components_main_screen_reviews_sections (title, description)
  values (@title, @description)
`);

const linkReviewToSection = db.prepare(
  'insert into components_main_screen_reviews_sections_reviews_lnk (reviews_section_id, review_id, review_ord) values (?, ?, ?)'
);

db.prepare('delete from main_screens_cmps').run();

const mainScreen = db.prepare('select id from main_screens limit 1').get();

if (mainScreen) {
  const ts = now();

  db.transaction(() => {
    /* Hero */
    const hero = insertHeroSection.run({
      title: 'Парк Чудес',
      description: '14 аттракционов для детей, подростков и взрослых. Записывайтесь на сеанс онлайн — без очередей.',
    });
    mainScreenCmp.run(mainScreen.id, hero.lastInsertRowid, 'main-screen.hero-section', 'heroSection', null);

    /* Преимущества */
    const advantages = insertAdvantageSection.run({ title: 'Почему стоит прийти' });
    const advantageId = advantages.lastInsertRowid;
    mainScreenCmp.run(mainScreen.id, advantageId, 'main-screen.advantage-section', 'advantagesSection', null);

    [
      { title: 'Без очередей', text: 'Запись на конкретное время сеанса — вы приходите и сразу проходите аттракцион.' },
      { title: 'Для любого возраста', text: 'От лодочек для малышей до 60 метров свободного падения для взрослых.' },
      { title: 'Все ограничения видно', text: 'Рост, возраст и противопоказания указаны в карточке каждого аттракциона.' },
      { title: 'Медпункт на территории', text: 'Дежурит с открытия парка, есть комната матери и ребёнка.' },
    ].forEach((advantage, index) => {
      const cmp = insertAdvantage.run({ title: advantage.title, text: advantage.text });
      db.prepare(
        'insert into components_main_screen_advantage_sections_cmps (entity_id, cmp_id, component_type, field, "order") values (?, ?, ?, ?, ?)'
      ).run(advantageId, cmp.lastInsertRowid, 'main-screen.advantage', 'advantages', index);
    });

    /* Популярные аттракционы */
    const recomended = insertRecomended.run({
      title: 'Популярные аттракционы',
      description: 'Наши хиты — выбирайте свой',
    });
    const recomendedId = recomended.lastInsertRowid;
    mainScreenCmp.run(mainScreen.id, recomendedId, 'main-screen.recomended-section', 'recomendedSection', null);

    // По одному аттракциону каждого типа.
    ['extreme', 'family', 'child'].forEach((type, index) => {
      const attraction = attractionIds.find((a) => a.type === type);
      if (attraction) {
        linkRecomendedAttraction.run(recomendedId, attraction.id, index + 1);
      }
    });

    /* Новости */
    const newsSection = insertNewsSection.run({
      title: 'Новости парка',
      description: 'Анонсы событий и сезонных акций',
    });
    mainScreenCmp.run(mainScreen.id, newsSection.lastInsertRowid, 'main-screen.news-section', 'newsSection', null);

    /* Отзывы */
    const reviewsSection = insertReviewsSection.run({
      title: 'Отзывы гостей',
      description: 'Что говорят посетители парка',
    });
    mainScreenCmp.run(
      mainScreen.id,
      reviewsSection.lastInsertRowid,
      'main-screen.reviews-section',
      'reviewsSection',
      null
    );

    const existingReviews = db.prepare('select id from reviews order by id limit 4').all();
    existingReviews.forEach((review, index) => {
      linkReviewToSection.run(reviewsSection.lastInsertRowid, review.id, index + 1);
    });

  })();

  log('  главная страница: заполнена');
}

/* ------------------------------------------------------------------ */
/*  Отзывы                                                             */
/* ------------------------------------------------------------------ */

const reviewCount = db.prepare('select count(*) as c from reviews').get().c;

if (reviewCount === 0) {
  const insertReview = db.prepare(`
    insert into reviews
      (document_id, rating, review, title, created_at, updated_at, published_at)
    values (@document_id, @rating, @review, @title, @ts, @ts, @ts)
  `);

  db.transaction(() => {
    for (const item of DATA.REVIEWS) {
      const ts = now();
      insertReview.run({
        document_id: documentId(),
        rating: item.rating,
        review: item.review,
        title: item.title,
        ts,
      });
    }
  })();

  log(`  отзывов: ${DATA.REVIEWS.length}`);
} else {
  log(`  отзывы: пропущено (уже есть ${reviewCount})`);
}

/* ------------------------------------------------------------------ */
/*  Гостевые заявки                                                    */
/* ------------------------------------------------------------------ */

const insertRequest = db.prepare(`
  insert into user_requests
    (document_id, name, second_name, email, phone, message, active_contact,
     status, admin_comment, created_at, updated_at, published_at)
  values
    (@document_id, @name, @second_name, @email, @phone, @message, @active_contact,
     @status, @admin_comment, @created_at, @updated_at, @published_at)
`);

db.transaction(() => {
  DATA.USER_REQUESTS.forEach((item, index) => {
    const ts = now() - (DATA.USER_REQUESTS.length - index) * 3600 * 1000 * 24;
    insertRequest.run({
      document_id: documentId(),
      name: item.name,
      second_name: item.secondName || null,
      email: item.email,
      phone: item.phone,
      message: item.message,
      active_contact: item.activeContact,
      status: item.status,
      admin_comment: item.adminComment || null,
      created_at: ts,
      updated_at: ts,
      published_at: ts,
    });
  });
})();

log(`  заявок: ${DATA.USER_REQUESTS.length}`);

/* ------------------------------------------------------------------ */
/*  Галерея                                                            */
/* ------------------------------------------------------------------ */

/**
 * Заполняются только альбомы и структура записей: сами изображения
 * и видео загружаются через админку Strapi (Upload plugin),
 * поэтому file_id у элементов остаётся пустым.
 */

const insertAlbum = db.prepare(`
  insert into gallery_albums
    (document_id, title, slug, description, sort_order,
     created_at, updated_at, published_at)
  values
    (@document_id, @title, @slug, @description, @sort_order,
     @created_at, @updated_at, @published_at)
`);

const insertGalleryItem = db.prepare(`
  insert into gallery_items
    (document_id, title, media_type, caption, sort_order,
     created_at, updated_at, published_at)
  values
    (@document_id, @title, @media_type, @caption, @sort_order,
     @created_at, @updated_at, @published_at)
`);

const linkAlbumItem = db.prepare(
  'insert into gallery_albums_items_lnk (album_id, gallery_item_id, album_ord) values (?, ?, ?)'
);

let albumCount = 0;
let galleryItemCount = 0;

const seedGallery = () => {
  db.transaction(() => {
    for (const album of DATA.GALLERY_ALBUMS) {
      const ts = now();
      const albumInfo = insertAlbum.run({
        document_id: documentId(),
        title: album.title,
        slug: album.slug,
        description: album.description,
        sort_order: album.sortOrder,
        created_at: ts,
        updated_at: ts,
        published_at: ts,
      });

      const albumId = albumInfo.lastInsertRowid;
      albumCount += 1;

      (album.items || []).forEach((item, index) => {
        const itemInfo = insertGalleryItem.run({
          document_id: documentId(),
          title: item.title,
          media_type: item.mediaType,
          caption: item.caption,
          sort_order: index + 1,
          created_at: ts,
          updated_at: ts,
          published_at: ts,
        });

        linkAlbumItem.run(albumId, itemInfo.lastInsertRowid, index + 1);
        galleryItemCount += 1;
      });
    }
  })();
};

seedGallery();

log(`  альбомов галереи: ${albumCount}, элементов: ${galleryItemCount}`);


/* ------------------------------------------------------------------ */
/*  Итог                                                               */
/* ------------------------------------------------------------------ */

console.log('');
console.log('Готово:');
for (const table of ['attractions', 'sessions', 'bookings', 'ticket_prices', 'news_items', 'pages', 'user_requests', 'gallery_albums', 'gallery_items']) {
  const count = db.prepare(`select count(*) as c from ${table}`).get().c;
  console.log(`  ${table.padEnd(16)} ${count}`);
}

const full = db.prepare("select count(*) as c from sessions where status = 'full'").get().c;
console.log(`  сеансов «мест нет»: ${full}`);

console.log('');
console.log('Демо-доступы (пароль Park2026!):');
for (const user of DEMO_USERS) {
  console.log(`  ${user.email}`);
}

db.close();