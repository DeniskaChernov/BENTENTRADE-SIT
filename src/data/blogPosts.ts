export interface BlogPost {
  id: string;
  slug: string;
  title: { ru: string; uz: string };
  description: { ru: string; uz: string };
  content: { ru: string[]; uz: string[] };
  date: string;
  image: string;
  tag: { ru: string; uz: string };
}

export const blogPosts: BlogPost[] = [
  {
    id: 'spring-collection',
    slug: 'spring-collection-2026',
    title: {
      ru: 'Новая весенняя коллекция кашпо 2026',
      uz: '2026-yil bahorgi yangi guldonlar to`plami',
    },
    description: {
      ru: 'Добавили новые фактуры и мягкие оттенки для интерьера и террас. Коллекция уже доступна для заказа.',
      uz: 'Interyer va terrasa uchun yangi faktura va yumshoq ranglarni qo`shdik. To`plam buyurtma uchun tayyor.',
    },
    content: {
      ru: [
        'В новой коллекции мы сделали акцент на спокойных оттенках и универсальных формах, которые легко сочетаются с современным интерьером.',
        'Часть моделей адаптирована под уличное использование: материал устойчив к влаге и солнечному свету при базовом уходе.',
        'Коллекция уже доступна для розничных и оптовых заказов. Для консультации можно оставить заявку через форму на сайте.',
      ],
      uz: [
        'Yangi to`plamda zamonaviy interyerga mos, sokin ranglar va universal shakllarga urg`u berdik.',
        'Ba`zi modellar tashqi foydalanish uchun moslashtirildi: material oddiy parvarishda namlik va quyoshga bardosh beradi.',
        'To`plam chakana va ulgurji buyurtmalar uchun ochiq. Maslahat uchun sayt orqali ariza qoldirishingiz mumkin.',
      ],
    },
    date: '02.04.2026',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80',
    tag: { ru: 'Новинка', uz: 'Yangi' },
  },
  {
    id: 'production-update',
    slug: 'production-update-2026',
    title: {
      ru: 'Обновление производства: стабильнее сроки',
      uz: 'Ishlab chiqarish yangilandi: muddatlar barqaror',
    },
    description: {
      ru: 'Оптимизировали процессы плетения и контроль качества. Заказы теперь комплектуются быстрее без потери качества.',
      uz: 'To`qish jarayoni va sifat nazorati optimallashtirildi. Buyurtmalar tezroq tayyorlanadi va sifat saqlanadi.',
    },
    content: {
      ru: [
        'Мы обновили внутренние этапы контроля качества и сократили лишние ручные операции на производстве.',
        'За счет этого средний срок подготовки заказа стал стабильнее, особенно для повторяющихся партий.',
        'Наша цель — сохранить ручной характер изделий, но сделать обслуживание клиентов быстрее и предсказуемее.',
      ],
      uz: [
        'Sifat nazoratining ichki bosqichlari yangilandi va ishlab chiqarishda ortiqcha qo`lda bajariladigan amallar qisqartirildi.',
        'Natijada, buyurtma tayyorlash muddati, ayniqsa takroriy partiyalar uchun, yanada barqaror bo`ldi.',
        'Maqsadimiz — mahsulotlarning qo`lda yaratilish ruhini saqlagan holda xizmat tezligi va aniqligini oshirish.',
      ],
    },
    date: '28.03.2026',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    tag: { ru: 'Производство', uz: 'Ishlab chiqarish' },
  },
  {
    id: 'care-guide',
    slug: 'rattan-care-guide',
    title: {
      ru: 'Как ухаживать за ротангом: 5 простых правил',
      uz: 'Rattanga parvarish: 5 ta oddiy qoida',
    },
    description: {
      ru: 'Подготовили практичную памятку по уходу за изделиями из ротанга, чтобы они дольше сохраняли вид.',
      uz: 'Rattan mahsulotlari uzoq vaqt chiroyli qolishi uchun parvarish bo`yicha amaliy eslatma tayyorladik.',
    },
    content: {
      ru: [
        'Регулярно очищайте поверхность мягкой сухой салфеткой и не используйте агрессивные чистящие средства.',
        'Для уличного использования рекомендуем периодически проверять изделия после дождя и убирать загрязнения без абразива.',
        'При сезонном хранении держите изделия в сухом месте и избегайте длительного контакта с открытым пламенем или сильным нагревом.',
      ],
      uz: [
        'Mahsulot yuzasini yumshoq quruq mato bilan muntazam arting va agressiv tozalash vositalaridan foydalanmang.',
        'Tashqi foydalanishda yomg`irdan keyin holatini tekshirib, kirlarni abrazivsiz tozalash tavsiya etiladi.',
        'Mavsumiy saqlashda mahsulotlarni quruq joyda saqlang va kuchli issiqlik yoki ochiq olovdan uzoq tuting.',
      ],
    },
    date: '22.03.2026',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=1200&q=80',
    tag: { ru: 'Советы', uz: 'Maslahat' },
  },
];

export const getBlogPostBySlug = (slug: string) => blogPosts.find((post) => post.slug === slug);
