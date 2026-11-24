# OXI — запись к lash-мастеру
Запись в студию OXI. Vite + React + Tailwind v4 + Supabase. Хостинг: GitHub Pages.

Адреса: / — клиенты, /#/admin — мастер (пин = пароль пользователя Supabase Auth).
Безопасность: RLS в supabase/schema.sql; клиент пишет только через RPC book_slot.

Какие файлы давать нейросети (контекст 16k):
- Поменять тексты/цены/часы/ссылки: src/config.js (+ supabase/schema.sql для услуг)
- Дизайн кнопок/карточек: src/components/ui.jsx + src/index.css
- Логика записи клиента: src/pages/ClientPage.jsx + src/lib/api.js
- Календарь: src/components/Calendar.jsx + src/lib/format.js
- Админка: src/pages/admin/AdminPage.jsx + нужная вкладка + src/lib/api.js
- Уведомления ВК: supabase/functions/notify-vk/index.ts
Команды: npm run dev / npm run build. Деплой: push в main.
