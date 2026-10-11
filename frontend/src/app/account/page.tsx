import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser, authFetch } from "@/lib/auth";
import { cancelBookingAction, logoutAction } from "@/app/actions/auth";
import styles from "./account.module.scss";

export const metadata: Metadata = {
  title: "Личный кабинет — Парк Чудес",
  robots: { index: false },
};

type Attraction = { id: number; title: string; type: string };

type Booking = {
  id: number;
  status: string;
  statusLabel: string;
  adultsCount: number;
  childrenCount: number;
  guestsCount: number;
  totalPrice: number;
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

  const bookings = await authFetch<BookingListResponse>("/api/bookings/me");

  const list: Booking[] = bookings.ok ? bookings.data.data ?? [] : [];

  const active = list.filter((b) => ["pending", "confirmed", "paid"].includes(b.status));
  const history = list.filter((b) => !["pending", "confirmed", "paid"].includes(b.status));

  const renderBooking = (booking: Booking) => {
    const attraction = booking.session?.attraction;
    const cancellable = CANCELLABLE.includes(booking.status);

    return (
      <article key={booking.id} className={styles.booking}>
        <div className={styles.bookingHead}>
          <h3>{attraction?.title ?? "Аттракцион"}</h3>
          <span className={`${styles.status} ${styles[`status_${booking.status}`] ?? ""}`}>
            {STATUS_LABELS[booking.status] ?? booking.status}
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

        {booking.wishes && <p className={styles.wishes}>Пожелания: {booking.wishes}</p>}

        {cancellable ? (
          <form action={cancelBookingAction}>
            <input type="hidden" name="id" value={booking.id} />
            <button type="submit" className={styles.cancel}>
              Отменить запись
            </button>
          </form>
        ) : (
          <p className={styles.hint}>Отмена недоступна: запись в статусе «{STATUS_LABELS[booking.status] ?? booking.status}».</p>
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
          <h2>Активные записи</h2>
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