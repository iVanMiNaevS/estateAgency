import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser, authFetch } from "@/lib/auth";
import { cancelBookingAction, logoutAction, prepayBookingAction } from "@/app/actions/auth";
import { DEPOSIT_PERCENT, depositAmount } from "@/constants/park";
import { ProfileForm } from "./profile-form";
import styles from "./account.module.scss";

export const metadata: Metadata = {
  title: "Личный кабинет — Парк Чудес",
  robots: { index: false },
};

type Attraction = { id: number; title: string; type: string };

type Booking = {
  id: number;
  // Имя не status: в Strapi это служебное поле документа
  // (черновик/публикация), и поле с таким именем не сохраняется из админки.
  bookingStatus: string;
  adultsCount: number;
  childrenCount: number;
  guestsCount: number;
  totalPrice: number;
  prepaidAmount: number | null;
  prepaidAt: string | null;
  wishes: string | null;
  canCancel: boolean;
  cancelHint: string | null;
  session: {
    id: number;
    date: string;
    startTime: string;
    attraction: Attraction | null;
  } | null;
};

type BookingListResponse = { data: Booking[]; meta?: unknown };

const STATUS_LABELS: Record<string, string> = {
  pending: "Новая",
  confirmed: "Подтверждена",
  paid: "Оплачена",
  completed: "Завершена",
  cancelled: "Отменена",
  rejected: "Отказ",
};

/** Статусы, в которых клиент ещё может отменить визит. */
const CANCELLABLE = ["pending", "confirmed", "paid"];

/** Статусы, в которых бронь ещё ждёт предоплату. */
const PREPAYABLE = ["pending", "confirmed"];

/** Сколько записей без предоплаты допускает сервер на человека. */
const UNPAID_LIMIT = 5;

/**
 * Бесплатный аттракцион: предоплата по нему не вносится.
 *
 * Название берём из демо-данных только для пояснения: проверка кнопки
 * опирается на нулевую сумму, а не на это имя.
 */
const FREE_ATTRACTION = "Детская площадка «Остров сокровищ»";

const ATTRACTION_TYPE_LABELS: Record<string, string> = {
  extreme: "Экстремальный",
  family: "Семейный",
  child: "Детский",
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatTime = (value: string) => value?.slice(0, 5) ?? "";

/**
 * Личный кабинет клиента.
 *
 * Страница серверная: пользователь проверяется запросом /users/me,
 * поэтому чужие бронирования показать невозможно даже при подмене
 * параметров в адресной строке.
 */
const Page = async () => {
  const user = await getSessionUser();

  // Повторная проверка на сервере: middleware отсекает только
  // отсутствие куки, но токен может оказаться протухшим.
  if (!user) {
    redirect("/login");
  }

  // Страницу задаём явно: без неё Strapi отдаёт первые 25 записей
  // молча, и гость с большим числом визитов не увидел бы часть
  // своих броней — а по счётчику неоплаченных решил бы, что их нет.
  const bookings = await authFetch<BookingListResponse>(
    "/bookings/me?pagination[pageSize]=100"
  );

  const list: Booking[] = bookings.ok ? bookings.data.data ?? [] : [];

  const active = list.filter((b) => ["pending", "confirmed", "paid"].includes(b.bookingStatus));
  const history = list.filter((b) => !["pending", "confirmed", "paid"].includes(b.bookingStatus));

  // Записи без предоплаты держат место, но денег не принесли. Их
  // число показываем явно: при достижении лимита сервер не даст
  // записаться снова, и гость должен понимать, что именно его
  // останавливает. Считаем так же, как сервер — записи без
  // предоплаты на сеансы, которые ещё не прошли, — иначе счётчик
  // разошёлся бы с отказом.
  const today = new Date().toISOString().slice(0, 10);
  const unpaidCount = active.filter(
    (b) =>
      PREPAYABLE.includes(b.bookingStatus) &&
      !b.prepaidAmount &&
      (b.session?.date ?? "") >= today
  ).length;

  const renderBooking = (booking: Booking) => {
    const attraction = booking.session?.attraction;
    const cancellable = CANCELLABLE.includes(booking.bookingStatus);

    return (
      <article key={booking.id} className={styles.booking}>
        <div className={styles.bookingHead}>
          <h3>{attraction?.title ?? "Аттракцион"}</h3>
          <span className={`${styles.status} ${styles[`status_${booking.bookingStatus}`] ?? ""}`}>
            {STATUS_LABELS[booking.bookingStatus] ?? booking.bookingStatus}
          </span>
        </div>

        {attraction && (
          <p className={styles.bookingType}>
            {ATTRACTION_TYPE_LABELS[attraction.type] ?? attraction.type}
          </p>
        )}

        <dl className={styles.details}>
          <div>
            <dt>Дата и время</dt>
            <dd>
              {booking.session
                ? `${formatDate(booking.session.date)}, ${formatTime(booking.session.startTime)}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Гостей</dt>
            <dd>
              {booking.guestsCount}
              {booking.childrenCount > 0 && (
                <span className={styles.guestsBreakdown}>
                  {" "}
                  (взрослых {booking.adultsCount}, детей {booking.childrenCount})
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt>Сумма</dt>
            <dd>{booking.totalPrice.toLocaleString("ru-RU")} ₽</dd>
          </div>
        </dl>

        {booking.prepaidAmount ? (
          <p className={styles.prepaid}>
            Предоплата {booking.prepaidAmount.toLocaleString("ru-RU")} ₽ внесена.{" "}
            {booking.bookingStatus === "paid"
              ? "Оплачено полностью."
              : `В кассе доплата ${(booking.totalPrice - booking.prepaidAmount).toLocaleString("ru-RU")} ₽.`}
          </p>
        ) : (
          cancellable && (
            <p className={styles.prepaidHint}>
              Без предоплаты место закреплено за вами, но не оплачено.
            </p>
          )
        )}

        {booking.wishes && <p className={styles.wishes}>Пожелания: {booking.wishes}</p>}

        {cancellable && (
          <div className={styles.actions}>
            {/* Бесплатной брони предоплата не нужна: сервер всё равно
                отклонит попытку внести 0 ₽. */}
            {PREPAYABLE.includes(booking.bookingStatus) &&
              !booking.prepaidAmount &&
              booking.totalPrice > 0 && (
              <form action={prepayBookingAction}>
                <input type="hidden" name="id" value={booking.id} />
                <button type="submit" className={styles.prepay}>
                  Внести предоплату — {depositAmount(booking.totalPrice).toLocaleString("ru-RU")} ₽
                </button>
              </form>
            )}
            <form action={cancelBookingAction}>
              <input type="hidden" name="id" value={booking.id} />
              <button type="submit" className={styles.cancel}>
                Отменить запись
              </button>
            </form>
          </div>
        )}

        {!cancellable && (
          <p className={styles.hint}>Отмена недоступна: запись в статусе «{STATUS_LABELS[booking.bookingStatus] ?? booking.bookingStatus}».</p>
        )}
      </article>
    );
  };

  return (
    <main className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <div>
            <h1>Личный кабинет</h1>
            <p className={styles.subtitle}>
              {user.name || user.username} · {user.email}
            </p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className={styles.logout}>
              Выйти
            </button>
          </form>
        </header>

        <section>
          <h2>Мои данные</h2>
          <p className={styles.sectionLead}>
            Телефон и дата рождения нужны администратору для связи и проверки
            возрастных ограничений. Роль назначает администратор — изменить её
            из кабинета нельзя.
          </p>
          <ProfileForm
            user={{
              name: user.name,
              lastName: user.lastName,
              phone: user.phone,
              city: user.city,
              birthDate: user.birthDate,
              email: user.email,
            }}
          />
        </section>

        <section>
          <h2>Активные записи</h2>

          <p className={styles.sectionLead}>
            Предоплата — {DEPOSIT_PERCENT}% от суммы, она закрепляет за вами
            место. Остаток сдаёте в кассе на месте. Кнопка внесения
            демонстрационная: настоящего списания не происходит.
          </p>

          <p className={unpaidCount >= UNPAID_LIMIT ? styles.limitHit : styles.sectionLead}>
            Записей без предоплаты: {unpaidCount} из {UNPAID_LIMIT}.{" "}
            {unpaidCount >= UNPAID_LIMIT
              ? "Чтобы записаться ещё, внесите предоплату или отмените одну из них."
              : "Запись бронирует место заранее и держит его до визита."}
          </p>

          <p className={styles.sectionLead}>
            Записи на «{FREE_ATTRACTION}» бесплатны — предоплата для них не
            требуется, но место они тоже занимают.
          </p>

          {active.length === 0 ? (
            <p className={styles.empty}>Активных записей пока нет.</p>
          ) : (
            <div className={styles.list}>{active.map(renderBooking)}</div>
          )}
        </section>

        <section>
          <h2>История посещений</h2>
          {history.length === 0 ? (
            <p className={styles.empty}>История пуста.</p>
          ) : (
            <div className={styles.list}>{history.map(renderBooking)}</div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Page;