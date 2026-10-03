import { memo } from 'react';

interface StructuredDataProps {
  type: 'home' | 'catalog' | 'product';
  productData?: {
    name: string;
    description: string;
    price: string;
    image: string;
    category: string;
  };
}

export const StructuredData = memo(function StructuredData({ type, productData }: StructuredDataProps) {
  // Базовая информация об организации
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bententrade",
    "url": "https://bententrade.uz",
    "logo": "https://bententrade.uz/logo.png",
    "description": "Производство и продажа качественной искусственной ротанговой нити и плетёных кашпо в Ташкенте",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ташкент",
      "addressLocality": "Ташкент",
      "addressRegion": "Ташкентская область",
      "postalCode": "100000",
      "addressCountry": "UZ"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+998-77-104-44-22",
      "contactType": "customer service",
      "areaServed": "UZ",
      "availableLanguage": ["ru", "uz"]
    },
    "sameAs": [
      "https://t.me/bententrade"
    ]
  };

  // LocalBusiness schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Bententrade",
    "image": "https://bententrade.uz/og-image.png",
    "@id": "https://bententrade.uz",
    "url": "https://bententrade.uz",
    "telephone": "+998771044422",
    "priceRange": "₸₸",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ташкент",
      "addressLocality": "Ташкент",
      "postalCode": "100000",
      "addressCountry": "UZ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 41.2995,
      "longitude": 69.2401
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    }
  };

  // WebSite schema с поиском
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bententrade",
    "url": "https://bententrade.uz",
    "description": "Производство и продажа ротанговой нити и плетёных кашпо в Ташкенте",
    "inLanguage": ["ru-UZ", "uz-UZ"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://bententrade.uz/catalog?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // BreadcrumbList schema
  const breadcrumbSchema = type === 'catalog' ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": "https://bententrade.uz/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Каталог",
        "item": "https://bententrade.uz/catalog"
      }
    ]
  } : null;

  // Product schema (если это страница товара)
  const productSchema = productData ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.name,
    "image": productData.image,
    "description": productData.description,
    "brand": {
      "@type": "Brand",
      "name": "Bententrade"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://bententrade.uz/catalog",
      "priceCurrency": "UZS",
      "price": productData.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Bententrade"
      }
    },
    "category": productData.category
  } : null;

  // FAQ Schema для главной страницы
  const faqSchema = type === 'home' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Где можно купить ротанговую нить в Ташкенте?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Вы можете купить качественную ротанговую нить в компании Bententrade в Ташкенте. Мы производим и продаем искусственную ротанговую нить различных цветов и размеров. Звоните: +998 77 104 44 22"
        }
      },
      {
        "@type": "Question",
        "name": "Какие цвета ротанговой нити доступны?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Мы предлагаем широкий выбор цветов ротанговой нити: классический черный, классический деревянный, золото, бронза, темно-коричневый, кирпичный и эксклюзивный цвет - черный с золотыми наплывами."
        }
      },
      {
        "@type": "Question",
        "name": "Сколько стоит ротанговая нить?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Цена ротанговой нити составляет 35 000 сум за килограмм. Минимальный заказ - 5 кг. Доставка по Ташкенту и Узбекистану."
        }
      },
      {
        "@type": "Question",
        "name": "Производите ли вы кашпо из ротанга?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Да, мы производим плетёные кашпо из ротанга различных размеров и стилей: настенные, подвесные, напольные. Цены от 55 000 сум."
        }
      }
    ]
  } : null;

  // ItemList schema для каталога
  const itemListSchema = type === 'catalog' ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Каталог продукции Bententrade",
    "description": "Ротанговая нить и плетёные кашпо",
    "numberOfItems": 9,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Product",
          "name": "Ротанговая нить классическая черная",
          "description": "Высококачественная искусственная ротанговая нить черного цвета",
          "offers": {
            "@type": "Offer",
            "price": "35000",
            "priceCurrency": "UZS"
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Product",
          "name": "Кашпо настенное",
          "description": "Плетёное кашпо для настенного размещения",
          "offers": {
            "@type": "Offer",
            "price": "55000",
            "priceCurrency": "UZS"
          }
        }
      }
    ]
  } : null;

  // Собираем все схемы в один массив
  const schemas = [
    organizationSchema,
    websiteSchema
  ];

  if (type === 'home') {
    schemas.push(localBusinessSchema);
    if (faqSchema) schemas.push(faqSchema);
  }

  if (type === 'catalog') {
    if (breadcrumbSchema) schemas.push(breadcrumbSchema);
    if (itemListSchema) schemas.push(itemListSchema);
  }

  if (productSchema) {
    schemas.push(productSchema);
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
});