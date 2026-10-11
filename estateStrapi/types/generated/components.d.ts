import type { Schema, Struct } from '@strapi/strapi';

export interface AttractionAttractionOption extends Struct.ComponentSchema {
  collectionName: 'components_attraction_attraction_options';
  info: {
    description: '\u041F\u0430\u0440\u0430 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0430/\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C / 10 \u043C\u0438\u043D\u0443\u0442';
    displayName: 'attractionOption';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images' | 'files'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String;
  };
}

export interface AttractionAttractionRestriction
  extends Struct.ComponentSchema {
  collectionName: 'components_attraction_attraction_restrictions';
  info: {
    description: '\u041E\u0434\u043D\u043E \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043F\u043E \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u044E \u0438\u043B\u0438 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438';
    displayName: 'attractionRestriction';
  };
  attributes: {
    isCritical: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface EstateOptionsEstate extends Struct.ComponentSchema {
  collectionName: 'components_estate_options_estates';
  info: {
    displayName: 'optionsEstate';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images' | 'files'>;
    text: Schema.Attribute.Enumeration<
      [
        '\u0421\u043F\u0430\u043B\u0435\u043D',
        '\u0414\u0443\u0448\u0435\u0432\u044B\u0445',
        '\u0412\u0438\u043B\u043B\u0430',
      ]
    >;
    type: Schema.Attribute.Enumeration<['bedrooms', 'showers', 'type']>;
    value: Schema.Attribute.String;
  };
}

export interface FaqSectionFaqSection extends Struct.ComponentSchema {
  collectionName: 'components_faq_section_faq_sections';
  info: {
    description: '\u0411\u043B\u043E\u043A FAQ \u0441 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u043E\u043C \u0438 \u0441\u043F\u0438\u0441\u043A\u043E\u043C \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432';
    displayName: 'faqSection';
  };
  attributes: {
    description: Schema.Attribute.Text;
    questions: Schema.Attribute.Component<'faq-section.question', true>;
    title: Schema.Attribute.String;
  };
}

export interface FaqSectionQuestion extends Struct.ComponentSchema {
  collectionName: 'components_faq_section_questions';
  info: {
    displayName: 'question';
  };
  attributes: {
    description: Schema.Attribute.Text;
    slug: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#'>;
    title: Schema.Attribute.String;
  };
}

export interface MainScreenAdvantage extends Struct.ComponentSchema {
  collectionName: 'components_main_screen_advantage_section_advantages';
  info: {
    displayName: 'advantage';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images' | 'files'>;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface MainScreenAdvantageSection extends Struct.ComponentSchema {
  collectionName: 'components_main_screen_advantage_sections';
  info: {
    description: '\u0411\u043B\u043E\u043A \u043F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432 \u043F\u0430\u0440\u043A\u0430 \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u0439 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435';
    displayName: 'advantageSection';
  };
  attributes: {
    advantages: Schema.Attribute.Component<'main-screen.advantage', true>;
    title: Schema.Attribute.String;
  };
}

export interface MainScreenFaqSection extends Struct.ComponentSchema {
  collectionName: 'components_main_screen_faq_sections';
  info: {
    displayName: 'faqSection';
  };
  attributes: {
    description: Schema.Attribute.Text;
    questions: Schema.Attribute.Component<'faq-section.question', true>;
    title: Schema.Attribute.String;
  };
}

export interface MainScreenHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_main_screen_hero_sections';
  info: {
    displayName: 'heroSection';
  };
  attributes: {
    description: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface MainScreenNewsSection extends Struct.ComponentSchema {
  collectionName: 'components_main_screen_news_sections';
  info: {
    description: '\u0411\u043B\u043E\u043A \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439 \u043F\u0430\u0440\u043A\u0430';
    displayName: 'newsSection';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface MainScreenRecomendedSection extends Struct.ComponentSchema {
  collectionName: 'components_main_screen_recomended_sections';
  info: {
    description: '\u0411\u043B\u043E\u043A \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0445 \u0430\u0442\u0442\u0440\u0430\u043A\u0446\u0438\u043E\u043D\u043E\u0432';
    displayName: 'recomendedSection';
  };
  attributes: {
    attractions: Schema.Attribute.Relation<
      'oneToMany',
      'api::attraction.attraction'
    >;
    description: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface MainScreenReviewsSection extends Struct.ComponentSchema {
  collectionName: 'components_main_screen_reviews_sections';
  info: {
    displayName: 'reviewsSection';
  };
  attributes: {
    description: Schema.Attribute.Text;
    reviews: Schema.Attribute.Relation<'oneToMany', 'api::review.review'>;
    title: Schema.Attribute.String;
  };
}

export interface PagePageBlock extends Struct.ComponentSchema {
  collectionName: 'components_page_page_blocks';
  info: {
    description: '\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u043B\u044C\u043D\u044B\u0439 \u0431\u043B\u043E\u043A \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u043E\u0439 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B: \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A, \u0442\u0435\u043A\u0441\u0442, \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0430';
    displayName: 'pageBlock';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files'>;
    items: Schema.Attribute.Component<'page.page-block-item', true>;
    layout: Schema.Attribute.Enumeration<['text', 'text-left', 'text-right']> &
      Schema.Attribute.DefaultTo<'text'>;
    text: Schema.Attribute.RichText;
    title: Schema.Attribute.String;
  };
}

export interface PagePageBlockItem extends Struct.ComponentSchema {
  collectionName: 'components_page_page_block_items';
  info: {
    description: '\u041F\u0443\u043D\u043A\u0442 \u0441\u043F\u0438\u0441\u043A\u0430 \u0432\u043D\u0443\u0442\u0440\u0438 \u0431\u043B\u043E\u043A\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B';
    displayName: 'pageBlockItem';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images' | 'files'>;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SeoSeo extends Struct.ComponentSchema {
  collectionName: 'components_seo_seos';
  info: {
    displayName: 'seo';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface TicketPricePriceInclude extends Struct.ComponentSchema {
  collectionName: 'components_ticket_price_price_includes';
  info: {
    description: '\u041F\u0443\u043D\u043A\u0442, \u0432\u0445\u043E\u0434\u044F\u0449\u0438\u0439 \u0432 \u0442\u0430\u0440\u0438\u0444';
    displayName: 'priceInclude';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'attraction.attraction-option': AttractionAttractionOption;
      'attraction.attraction-restriction': AttractionAttractionRestriction;
      'estate.options-estate': EstateOptionsEstate;
      'faq-section.faq-section': FaqSectionFaqSection;
      'faq-section.question': FaqSectionQuestion;
      'main-screen.advantage': MainScreenAdvantage;
      'main-screen.advantage-section': MainScreenAdvantageSection;
      'main-screen.faq-section': MainScreenFaqSection;
      'main-screen.hero-section': MainScreenHeroSection;
      'main-screen.news-section': MainScreenNewsSection;
      'main-screen.recomended-section': MainScreenRecomendedSection;
      'main-screen.reviews-section': MainScreenReviewsSection;
      'page.page-block': PagePageBlock;
      'page.page-block-item': PagePageBlockItem;
      'seo.seo': SeoSeo;
      'ticket-price.price-include': TicketPricePriceInclude;
    }
  }
}
