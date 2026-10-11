import styles from "../../../app/(withHeaderFooter)/catalog/catalog.module.scss";
import { RequestForm } from "@/components/forms/request-form";
import { SiteSearch } from "@/components/forms/site-search";

type Props = {
	sectionId?: string;
};

/**
 * Блок связи на странице каталога.
 *
 * Раньше форма отправляла запрос в Strapi прямо из браузера.
 * Теперь это серверный компонент, а отправка идёт через
 * server action: адрес бэкенда клиенту не известен, проверки
 * полей и согласия выполняются на сервере.
 */
export const ConnSection = ({ sectionId }: Props) => {
	return (
		<section className={styles.connSection} id={sectionId}>
			<div className="container">
				<div className={styles.connSection__top}>
					<h2>Остались вопросы?</h2>
					<p>Напишите нам — подскажем по тарифам и расписанию.</p>
				</div>

				<RequestForm />
			</div>
		</section>
	);
};

/** Поиск по сайту для страницы каталога. */
export const CatalogSearch = ({ sectionId }: Props) => (
	<section id={sectionId}>
		<div className="container">
			<SiteSearch />
		</div>
	</section>
);