import type { Schema, Struct } from '@strapi/strapi';

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

export interface MainScreenRecomendedSection extends Struct.ComponentSchema {
  collectionName: 'components_main_screen_recomended_sections';
  info: {
    displayName: 'recomendedSection';
  };
  attributes: {
    description: Schema.Attribute.String;
    estates: Schema.Attribute.Relation<'oneToMany', 'api::estate.estate'>;
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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'estate.options-estate': EstateOptionsEstate;
      'faq-section.question': FaqSectionQuestion;
      'main-screen.faq-section': MainScreenFaqSection;
      'main-screen.hero-section': MainScreenHeroSection;
      'main-screen.recomended-section': MainScreenRecomendedSection;
      'main-screen.reviews-section': MainScreenReviewsSection;
      'seo.seo': SeoSeo;
    }
  }
}
