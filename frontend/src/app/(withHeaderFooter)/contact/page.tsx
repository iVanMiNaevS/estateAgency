import type { Metadata } from "next";
import { CardTextLogo, type typeCardTextLogo } from "@/ui/cardTextLogo/cardTextLogo";
import { RequestForm } from "@/components/forms/request-form";

import emailLogo from "@/../public/icons/email2.svg";
import phoneLogo from "@/../public/icons/phone.svg";
import geoLogo from "@/../public/icons/geo.svg";
import clockLogo from "@/../public/icons/ratingStar.svg";
import styles from "./contact.module.scss";

export const metadata: Metadata = {
  title: "Контакты — Парк Чудес",
  description: "Адрес, телефон, часы работы и схема проезда парка развлечений в Рязани",
};

/**
 * Контакты парка.
 *
 * Страница стала серверной: форма заявки отправляется через
 * server action, поэтому браузер ни адрес Strapi, ни правила
 * валидации не видит.
 */
const Page = () => {
  const cards: typeCardTextLogo[] = [
    { logo: geoLogo, text: "Рязань, ул. Экстремальная, 12" },
    { logo: phoneLogo, text: "+7 (4912) 000-00-00" },
    { logo: emailLogo, text: "info@park-chudes.ru" },
    { logo: clockLogo, text: "Ежедневно с 10:00 до 22:00" },
  ];

  return (
    <div>
      <section id="contact-sectionHello" className={styles.helloSection}>
        <div className="container">
          <h1 className="h2">Свяжитесь с парком «Чудес»</h1>
          <p className={styles.helloSection__desc}>
            Подскажем по тарифам и расписанию, поможем подобрать аттракционы по возрасту и росту
            гостей, примем заявку на групповое посещение. Если рядом оказалось сложно — позвоните
            или напишите, подскажем дорогу.
          </p>
        </div>
      </section>

      <section id="contact-sectionCardText" className={styles.cardsTextLogoSection}>
        <div className="container cards">
          {cards.map((card) => (
            <CardTextLogo key={card.text} logo={card.logo} text={card.text} />
          ))}
        </div>
      </section>

      <section id="contact-sectionForm" className={styles.formSection}>
        <div className="container">
          <div className={styles.formSection__top}>
            <h2 className="h2">Задать вопрос</h2>
            <p>Опишите, что хотите узнать, и мы свяжемся с вами в ближайшее время.</p>
          </div>

          <RequestForm />
        </div>
      </section>
    </div>
  );
};

export default Page;