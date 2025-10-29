import type { Schema, Struct } from '@strapi/strapi';

export interface EstateOptionsEstate extends Struct.ComponentSchema {
  collectionName: 'components_estate_options_estates';
  info: {
    displayName: 'optionsEstate';
  };
  attributes: {
    text: Schema.Attribute.Enumeration<
      [
        '\u0421\u043F\u0430\u043B\u044C\u043D\u0438',
        '\u0414\u0443\u0448\u0435\u0432\u044B\u0445',
        '\u0412\u0438\u043B\u043B\u0430',
      ]
    >;
    Type: Schema.Attribute.Enumeration<['bedrooms', 'showers', 'type']>;
    value: Schema.Attribute.String;
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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'estate.options-estate': EstateOptionsEstate;
      'main-screen.hero-section': MainScreenHeroSection;
      'main-screen.recomended-section': MainScreenRecomendedSection;
      'main-screen.reviews-section': MainScreenReviewsSection;
    }
  }
}
