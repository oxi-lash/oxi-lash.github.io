# Резервные копии и откат — OXI

Короткая шпаргалка: что где лежит, как сохранить рабочую версию и как вернуться,
если правки что-то сломали.

## Что где хранится

| Что | Где | Резервная копия |
|---|---|---|
| Код сайта | GitHub: `KrivoschekovOleg-student/oxi` | git-история, теги, Releases (zip) |
| Сам сайт | GitHub Pages: `https://krivoschekovoleg-student.github.io/oxi/` | пересобирается из кода |
| Услуги, окошки, записи | Supabase (облако) | экспорт CSV / `pg_dump` (см. ниже) |
| Схема БД | `supabase/schema.sql` в репозитории | уже в git |
| Уведомления ВК | Supabase Edge Function `notify-vk` | код в `supabase/functions/notify-vk/index.ts` |

**Важно:** данные клиентов в git НЕ хранятся. Код можно откатить в любой момент,
а записи — только из бэкапа Supabase.

## Никогда не коммитить

- `.env` — ключи Supabase (уже в `.gitignore`);
- `env.txt`, любые файлы с `VK_TOKEN`, `service_role`, `sb_secret_…`.

Проверка перед пушем:

```powershell
git status --short
git ls-files | Select-String -Pattern "^\.env$|env\.txt|secret|token"
```

## Сохранение рабочей версии

### Тег (неизменяемая «закладка»)

```powershell
git tag -a v1.0.0 -m "Рабочая версия: OXI, запись, админка, ВК"
git push origin v1.0.0
```

Посмотреть все закладки: `git tag -l`.

### Ветка-эталон

```powershell
git branch v1-stable v1.0.0
git push origin v1-stable
```

### GitHub Release (архив исходников)

Репозиторий → **Releases → Draft a new release** → выбрать тег `v1.0.0` →
**Publish release**. GitHub приложит `Source code (zip)` — скачайте и сохраните
на диск/в облако. Это спасение, если сломается даже git.

## Как откатиться

| Ситуация | Команда |
|---|---|
| Вернуть один файл из версии 1.0.0 | `git checkout v1.0.0 -- src/config.js` |
| Отменить последний коммит (с историей) | `git revert HEAD` → `git push` |
| Вернуть ровно версию 1.0.0 | `git reset --hard v1.0.0` → `git push --force-with-lease` |
| Совсем беда | Скачать Release zip, распаковать поверх папки, `npm install`, `git push` |

⚠️ `git reset --hard` и `git checkout -- файл` **затирают** незакоммиченные
правки. Сначала `git status`, при сомнении — `git stash`.

## Безопасный цикл правок

```powershell
git switch -c правки-цены     # отдельная ветка, живой сайт не меняется
# правим файлы
npm run dev                   # смотрим локально
npm run build                 # проверяем сборку
git switch main
git merge правки-цены
git push                      # сайт обновится за 1–2 минуты
```

Не понравилось — `git switch main`, ветку удалить: прод не тронут.

## Бэкап данных Supabase

1. Supabase → **Database → Backups** — проверить, что доступно на тарифе.
2. Или экспорт вручную: **SQL Editor** →
   `select * from public.bookings;` → кнопка выгрузки CSV. То же для `slots`, `services`.
3. Или полный дамп (нужна строка подключения из Settings → Database):

```powershell
pg_dump "postgresql://postgres:ПАРОЛЬ@db.ПРОЕКТ.supabase.co:5432/postgres" `
  --no-owner --no-privileges -f backup.sql
```

## Если сайт «замолчал»

| Симптом | Причина | Что делать |
|---|---|---|
| Услуги/окошки не грузятся | Free-проект Supabase уснул (неделя без запросов) | Supabase → проект → **Restore/Resume** |
| Telegram/ВК уведомления не приходят | токен ВК отозван или ошибка `901` | пересоздать ключ → обновить секрет `VK_TOKEN` |
| Автодеплой не запускается | GitHub отключил cron/Pages | Actions → **Deploy to GitHub Pages → Run workflow** |
| Пин не подходит | пользователь Auth удалён/переименован | Authentication → Users |

Keepalive (`keepalive.yml`) пингует базу по понедельникам и четвергам.
GitHub отключает расписания после ~60 дней без коммитов — раз в пару месяцев
делайте любой коммит или запускайте workflow вручную.
