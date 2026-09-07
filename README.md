# myneighbors

**Русская версия — [ниже](#русская-версия).**

**[myneighbors.sharapov.biz](https://myneighbors.sharapov.biz)** — what else lives at
an IP address, and in the block around it.

No ads, no registration, no accounts. Nothing you look up is stored. MIT licensed,
twelve languages, one `docker run` to host your own.

```bash
curl myneighbors.sharapov.biz/8.8.8.8
```

---

## Two questions, and they are not the same one

**Who else is at this exact address?** Shared hosting, one machine, many sites. DNS
has no answer to this: it maps a name to an address and has no question for the
other direction. Every answer therefore comes from somebody's index — a certificate,
a crawl, a log — and every index is a claim about the past.

**Who else is in the block around it?** One operator, many machines. Here there is
something to measure: the block holds a finite number of addresses, each of them can
be asked for its reverse DNS, and each of them will show a certificate to anyone who
connects without naming a site.

This service answers both, keeps them apart in the report, and — the part that
matters — resolves every name forward again before calling it a neighbour.

## What it actually does

**Works out which block the address is in, and does not pretend there is one answer.**
"The same subnet" is at least three facts that routinely disagree:

| | What it is | Typical width |
| --- | --- | --- |
| Registry allocation | The range a RIR handed to somebody. Says who owns the address. | /29 … /24 |
| Routed prefix | What the global routing table actually carries, read from Team Cymru over DNS. Says whose network announces it. | /24 … /20 |
| The /24 | Not a fact from any registry — the unit hosting is sold in, and the one a sweep can finish. | /24 |

All three are reported. The sweep runs over the widest of them that fits under the
limit, and every neighbour found is marked with which of the three it also falls in.

**Reads reverse DNS for every address in the block.** A PTR query goes to a resolver,
never to the address it is about, so this half touches nobody. For a block of
dedicated servers it is the most productive stage — mail requires PTR, so hosting
companies set it — though what comes back is usually the provider's naming rather
than the sites.

**Opens one TLS connection per address and reads the certificate.** No SNI is sent,
which is the whole point: a server asked for nothing in particular shows its default
certificate, and on a shared host that certificate lists the domains it serves. A
HEAD request rides on the same connection, so the `Server` banner and any redirect
cost nothing extra. One connection per address, closed as soon as it has answered,
no payload beyond a ClientHello and a HEAD, no second port, no retry.

**Asks the indexes about the address itself.** Reverse-IP providers where a key is
configured, plus certificate transparency to widen a domain already found. A CDN
edge is exempt: one address there fronts millions of unrelated sites, and a handful
of them is not an answer.

**Resolves every candidate forward again.** This is the stage that separates a
reverse-IP answer from one worth reading. A PTR record is whatever the block's owner
last typed; a certificate lists the names it was issued for, not the ones still
hosted; a reverse-IP index is a crawl from some point in time; a CT log never forgets
anything. Reported unchecked, all four go stale silently. So each name is labelled by
what DNS says now:

```
confirmed    an A/AAAA record points at exactly this address
in-block     it points somewhere else inside the block
moved        it resolves, but outside the block
unresolved   nothing answers for it any more
```

Only the first two are ever called a neighbour. The rest are listed separately, which
is usually the more interesting table.

## Where it honestly stops

* **IPv6 blocks are described, never walked.** A /64 holds 1.8 × 10¹⁹ addresses.
  Address scanning does not exist on IPv6 and no amount of engineering changes that;
  only what the indexes already know can be reported.
* **CDN and proxy addresses.** Detected by ASN and reported as such, with the
  indexes left unasked.
* **Coverage.** A corporate /24 with PTR and certificates: most of it. A typical
  shared host with no reverse-IP key configured: some of it. Behind a CDN: none of
  it. The report says which sources answered rather than implying it saw everything.

## Restraint, deliberately

This is the one service in the family that connects to machines whose owners did not
ask for a scan, so the limits are part of the design rather than configuration:

* one connection per address, to 443 only, closed after the first answer;
* nothing but a ClientHello and a HEAD — no probing, no second port, no retry;
* sweeps happen when somebody asks about an address, never as a background crawl of
  the internet;
* private and reserved space is refused outright, so the service cannot be pointed
  at the network it runs in;
* every outbound request names the service and links to the page explaining it, so
  an operator who wants it to stop has something to grep for and somebody to write to;
* `PROBE_ENABLED=false`, or `?probe=false` on a single request, turns the active
  half off and leaves the passive one working.

## API

| Route | Response |
| --- | --- |
| `GET /` · `GET /<ip>` | Page for browsers, JSON for console clients |
| `GET /<ip>-<prefix>` | A block, e.g. `/45.10.244.0-24` |
| `GET /<ip>/<prefix>` | The same, redirected to the dash form |
| `GET /api/<target>` | Always data |
| `GET /api/stream/<target>` | The same check as server-sent events |
| `GET /healthz` | Liveness probe, cache stats and which sources are configured |

Parameters: `output=json|yaml|html`, `lang=<code>`, `prefix=<n>` to set the block
width, `probe=false` to skip the certificate sweep, `refresh=1` to bypass the cache,
`download=1` to serve as a file.

```bash
curl -s "https://myneighbors.sharapov.biz/api/1.1.1.1?output=yaml&lang=en"
curl -sL "https://myneighbors.sharapov.biz/api/45.10.244.0/24"
curl -s "https://myneighbors.sharapov.biz/api/sharapov.biz?probe=false"
```

Errors are JSON with `statusCode`, `error` and `message`. A private or reserved
address answers `private-address` without a packet leaving the box.

## Running your own

```bash
git clone https://github.com/sharapov-outsource/myneighbors.git
npm install && npm start
```

Opens on http://localhost:3029

```bash
docker build -t myneighbors .
docker run --rm -p 3029:3029 myneighbors
```

### Configuration

| Variable | Default | What it does |
| --- | --- | --- |
| `PORT` | `3029` | Listen port |
| `MAX_SCAN_HOSTS` | `256` | Addresses one sweep may walk — also the widest prefix a caller may ask for |
| `PROBE_ENABLED` | `true` | The active half: one TLS connection per address |
| `PROBE_PORT` | `443` | Port the probe connects to |
| `PROBE_CONCURRENCY` | `12` | Connections open at once |
| `PROBE_TIMEOUT_MS` | `6000` | Per-connection deadline |
| `PTR_CONCURRENCY` | `16` | Reverse lookups in flight |
| `VERIFY_LIMIT` | `400` | Candidate names confirmed per report |
| `DNS_RESOLVER` | `1.1.1.1` | Resolver used for PTR and confirmation |
| `HACKERTARGET_ENABLED` | `true` | Free reverse-IP source; set `false` to stop using it |
| `CT_ENABLED` | `true` | Widen found domains through crt.sh |
| `SHODAN_API_KEY` | — | Switches on Shodan as a reverse-IP source |
| `SECURITYTRAILS_API_KEY` | — | Switches on SecurityTrails |
| `VIEWDNS_API_KEY` | — | Switches on ViewDNS |
| `SCAN_TIMEOUT_MS` | `90000` | Hard ceiling on one report |
| `ALLOW_PRIVATE_TARGETS` | `false` | Lifts the private-address guard. For tests only |

With no keys configured the service still works; coverage of shared hosting is what
improves when one is added, and `/healthz` says which are in use.

## Development

```bash
npm test          # syntax, translations, unit tests and the smoke run
npm run test:unit # unit tests alone
npm run smoke     # boots the server and exercises every route
npm run icons     # redraws the icon set from scripts/make-icons.js
```

The smoke test never starts a real sweep. This service opens a connection per
address, and a smoke test pointed at a live network would be a few hundred
connections at somebody else's machines every time CI runs — so it uses malformed
targets, private space and one name that cannot resolve, and the reasoning is
covered by unit tests instead.

The probe is tested against a TLS server the test starts itself, with a throwaway
certificate carrying known SANs. That test also asserts that no server name is sent
in the handshake, because an SNI-less ClientHello is the thing that makes a shared
host reveal its default certificate — and it is invisible from anywhere else.

Translations live in [public/i18n.js](public/i18n.js), one block per language layered
over the shared dictionary in the service kit. To add a language: copy the `en` block,
translate the values, and run `npm run check:i18n` — it fails on a language that is
half-finished, because that is drift rather than a decision.

## Built on

[@sharapov/service-kit](https://github.com/sharapov-outsource/service-kit) for the
HTTP shell, content negotiation, the content security policy, the cache, the paced
outbound scheduler and the design system;
[@sharapov/dns-wire](https://github.com/sharapov-outsource/dns-wire) for the DNS
codec. Registry data comes from RDAP, routing from Team Cymru's DNS interface, and
certificate history from crt.sh.

## The rest of the family

[myip](https://myip.sharapov.biz) · [myssl](https://myssl.sharapov.biz) ·
[mydns](https://mydns.sharapov.biz) · [mymx](https://mymx.sharapov.biz) ·
[myheaders](https://myheaders.sharapov.biz)

## Licence

MIT. See [LICENSE](LICENSE).

---

## Русская версия

**[myneighbors.sharapov.biz](https://myneighbors.sharapov.biz)** — кто ещё живёт на
IP-адресе и в блоке вокруг него.

Без рекламы, регистрации и аккаунтов. Ничего из того, что вы ищете, не сохраняется.
Лицензия MIT, двенадцать языков, один `docker run` для своего экземпляра.

```bash
curl myneighbors.sharapov.biz/8.8.8.8
```

### Два вопроса, и это не один и тот же вопрос

**Кто ещё на этом же адресе?** Шаред-хостинг: одна машина, много сайтов. У DNS ответа
на это нет — он ведёт от имени к адресу и обратного вопроса не задаёт. Поэтому любой
ответ приходит из чьего-то индекса: сертификата, обхода, журнала. А любой индекс —
это утверждение о прошлом.

**Кто ещё в блоке вокруг?** Один оператор, много машин. Здесь есть что измерить: в
блоке конечное число адресов, у каждого можно спросить обратный DNS, и каждый покажет
сертификат тому, кто подключится, не назвав сайт.

Сервис отвечает на оба вопроса, держит их в отчёте раздельно и — это и есть главное —
перепроверяет каждое имя прямым запросом, прежде чем назвать его соседом.

### Что именно он делает

**Выясняет, в каком блоке адрес, и не делает вид, что ответ один.** «Та же подсеть» —
это минимум три факта, которые регулярно расходятся:

| | Что это | Обычная ширина |
| --- | --- | --- |
| Выделение из реестра | Диапазон, который RIR кому-то выдал. Говорит, чей это адрес. | /29 … /24 |
| Анонсируемый префикс | То, что реально несёт глобальная таблица маршрутизации; читается у Team Cymru по DNS. Говорит, чья сеть его объявляет. | /24 … /20 |
| /24 | Не факт из реестра — единица, которой торгует хостинг, и единственная, которую можно обойти целиком. | /24 |

В отчёте есть все три. Обход идёт по самому широкому из них, который укладывается в
лимит, и у каждого найденного соседа отмечено, в какие из трёх он попадает.

**Читает обратный DNS для каждого адреса блока.** PTR-запрос уходит резолверу, а не
адресу, о котором спрашивают, — эта половина не трогает никого. Для блока выделенных
серверов она самая результативная: почта требует PTR, поэтому хостеры его ставят. Хотя
возвращается обычно схема именования провайдера, а не сами сайты.

**Открывает по одному TLS-соединению на адрес и читает сертификат.** SNI не
отправляется, и в этом весь смысл: сервер, у которого ничего конкретного не спросили,
показывает сертификат по умолчанию, а на шаред-хостинге в этом сертификате перечислены
обслуживаемые домены. По тому же соединению уходит HEAD-запрос, так что баннер
`Server` и любой редирект достаются бесплатно. Одно соединение на адрес, закрывается
сразу после ответа, ничего кроме ClientHello и HEAD, ни второго порта, ни повторов.

**Спрашивает индексы про сам адрес.** Reverse-IP-провайдеров, для которых задан ключ,
плюс Certificate Transparency — чтобы расширить уже найденный домен. Узел CDN
исключён: за одним адресом там миллионы никак не связанных сайтов, и горстка из них —
не ответ.

**Проверяет каждое имя-кандидат прямым запросом.** Именно этот шаг отличает reverse-IP
ответ от ответа, который стоит читать. PTR-запись — это то, что владелец блока когда-то
вписал; в сертификате перечислены имена, на которые он выписан, а не те, что здесь ещё
живут; reverse-IP индекс — обход от какого-то момента в прошлом; CT-лог не забывает
вообще ничего. Без перепроверки все четыре источника молча протухают. Поэтому каждое
имя помечается тем, что говорит DNS сейчас:

```
confirmed    запись A/AAAA указывает ровно на этот адрес
in-block     указывает на другой адрес внутри блока
moved        разрешается, но за пределы блока
unresolved   больше не разрешается вообще
```

Соседом имя признаётся только в первых двух случаях. Остальные вынесены в
отдельную таблицу — обычно она интереснее.

### Где метод честно кончается

* **Блоки IPv6 описываются, но не обходятся.** В /64 — 1,8 × 10¹⁹ адресов.
  Сканирования адресов в IPv6 не существует, и никакая инженерия этого не меняет;
  показать можно только то, что уже знают индексы.
* **Адреса CDN и прокси.** Определяются по ASN и так и помечаются, индексы при этом
  не опрашиваются.
* **Покрытие.** Корпоративный /24 с PTR и сертификатами — почти целиком. Типичный
  шаред-хостинг без ключа reverse-IP — частично. За CDN — никак. В отчёте перечислено,
  какие источники ответили, а не создаётся впечатление, что увидено всё.

### Сдержанность — намеренно

Это единственный сервис семьи, который подключается к машинам, чьи владельцы о
проверке не просили, поэтому ограничения — часть конструкции, а не настройка:

* одно соединение на адрес, только 443, закрывается после первого ответа;
* ничего кроме ClientHello и HEAD — ни прощупывания, ни второго порта, ни повторов;
* обход происходит, когда кто-то спросил про адрес, и никогда как фоновый обход
  интернета;
* приватное и зарезервированное пространство отклоняется сразу, так что сервис нельзя
  направить на сеть, в которой он сам работает;
* каждый исходящий запрос называет сервис и ссылается на страницу с объяснением —
  чтобы оператору, который хочет это прекратить, было что грепать и кому написать;
* `PROBE_ENABLED=false` или `?probe=false` в отдельном запросе выключают активную
  половину, оставляя пассивную работать.

### API

| Маршрут | Ответ |
| --- | --- |
| `GET /` · `GET /<ip>` | Страница для браузеров, JSON для консольных клиентов |
| `GET /<ip>-<prefix>` | Блок, например `/45.10.244.0-24` |
| `GET /<ip>/<prefix>` | То же самое с редиректом на форму с дефисом |
| `GET /api/<target>` | Всегда данные |
| `GET /api/stream/<target>` | Та же проверка через server-sent events |
| `GET /healthz` | Проба живости, статистика кэша и список настроенных источников |

Параметры: `output=json|yaml|html`, `lang=<код>`, `prefix=<n>` — ширина блока,
`probe=false` — пропустить сбор сертификатов, `refresh=1` — мимо кэша, `download=1` —
отдать файлом.

```bash
curl -s "https://myneighbors.sharapov.biz/api/1.1.1.1?output=yaml&lang=ru"
curl -sL "https://myneighbors.sharapov.biz/api/45.10.244.0/24"
curl -s "https://myneighbors.sharapov.biz/api/sharapov.biz?probe=false"
```

Ошибки — JSON с `statusCode`, `error` и `message`. Приватный или зарезервированный
адрес получает `private-address`, и наружу не уходит ни одного пакета.

### Запуск своего экземпляра

```bash
git clone https://github.com/sharapov-outsource/myneighbors.git
npm install && npm start
```

Откроется на http://localhost:3029

```bash
docker build -t myneighbors .
docker run --rm -p 3029:3029 myneighbors
```

#### Настройка

| Переменная | По умолчанию | Что делает |
| --- | --- | --- |
| `PORT` | `3029` | Порт |
| `MAX_SCAN_HOSTS` | `256` | Сколько адресов можно обойти за одну проверку — и самый широкий префикс, который разрешено запросить |
| `PROBE_ENABLED` | `true` | Активная половина: по TLS-соединению на адрес |
| `PROBE_PORT` | `443` | Порт, к которому подключается проба |
| `PROBE_CONCURRENCY` | `12` | Сколько соединений открыто одновременно |
| `PROBE_TIMEOUT_MS` | `6000` | Дедлайн одного соединения |
| `PTR_CONCURRENCY` | `16` | Обратных запросов в полёте |
| `VERIFY_LIMIT` | `400` | Сколько кандидатов подтверждается за отчёт |
| `DNS_RESOLVER` | `1.1.1.1` | Резолвер для PTR и подтверждения |
| `HACKERTARGET_ENABLED` | `true` | Бесплатный reverse-IP источник; `false` — не использовать |
| `CT_ENABLED` | `true` | Расширять найденные домены через crt.sh |
| `SHODAN_API_KEY` | — | Включает Shodan как источник reverse-IP |
| `SECURITYTRAILS_API_KEY` | — | Включает SecurityTrails |
| `VIEWDNS_API_KEY` | — | Включает ViewDNS |
| `SCAN_TIMEOUT_MS` | `90000` | Жёсткий потолок на один отчёт |
| `ALLOW_PRIVATE_TARGETS` | `false` | Снимает запрет на приватные адреса. Только для тестов |

Без единого ключа сервис работает; ключи улучшают покрытие шаред-хостинга, а
`/healthz` показывает, какие источники задействованы.

### Разработка

```bash
npm test          # синтаксис, переводы, юнит-тесты и дымовой прогон
npm run test:unit # только юнит-тесты
npm run smoke     # поднимает сервер и проходит по всем маршрутам
npm run icons     # перерисовывает набор иконок из scripts/make-icons.js
```

Дымовой тест никогда не запускает настоящий обход. Сервис открывает соединение на
каждый адрес, и дымовой тест, направленный на живую сеть, был бы парой сотен
соединений к чужим машинам на каждый прогон CI — поэтому он работает на некорректных
целях, приватном пространстве и одном неразрешимом имени, а логика покрыта
юнит-тестами.

Проба проверяется на TLS-сервере, который тест поднимает сам, с одноразовым
сертификатом с известными SAN. Тот же тест утверждает, что в рукопожатии не
отправляется имя сервера: ClientHello без SNI — это ровно то, что заставляет
шаред-хостинг показать сертификат по умолчанию, и снаружи это никак не видно.

Переводы лежат в [public/i18n.js](public/i18n.js) — по блоку на язык поверх общего
словаря из service-kit. Чтобы добавить язык: скопируйте блок `en`, переведите
значения и запустите `npm run check:i18n` — он падает на языке, переведённом наполовину,
потому что это дрейф, а не решение.

### На чём построено

[@sharapov/service-kit](https://github.com/sharapov-outsource/service-kit) — HTTP-обвязка,
согласование форматов, политика безопасности, кэш, планировщик исходящих соединений и
дизайн-система; [@sharapov/dns-wire](https://github.com/sharapov-outsource/dns-wire) —
кодек DNS. Данные реестра — из RDAP, маршрутизация — из DNS-интерфейса Team Cymru,
история сертификатов — из crt.sh.

### Остальная семья

[myip](https://myip.sharapov.biz) · [myssl](https://myssl.sharapov.biz) ·
[mydns](https://mydns.sharapov.biz) · [mymx](https://mymx.sharapov.biz) ·
[myheaders](https://myheaders.sharapov.biz)

### Лицензия

MIT. См. [LICENSE](LICENSE).
