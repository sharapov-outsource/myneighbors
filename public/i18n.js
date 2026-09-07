/* myneighbors — the words that are this service's own.
 *
 * The shared vocabulary lives in the service kit and is translated into all
 * twelve languages there. A language block missing here falls back to English;
 * `npm run check:i18n` reports which, and fails on one that is half-finished. */
'use strict';

var OWN = {};

OWN.en = {
  title: 'Neighbors Check — what else lives at this address and in its block',
  title_short: 'Neighbors Check',
  h1: 'Neighbors Check',
  subtitle: 'Everything else living at an address and in the block around it: reverse DNS, the names on each certificate, the registry and the routing table — and every name resolved forward again before it is called a neighbour',
  ph_host: '8.8.8.8',
  hero_label: 'Address being examined',
  hero_count: 'sites here',
  badge_cdn: 'CDN edge',
  empty_hint: 'Enter an IP address, a block as 8.8.8.0-24, or a domain name. The check works out which block the address belongs to — the registry allocation, the routed prefix and the /24 rarely agree — then reads reverse DNS for every address in it and the certificate each one presents when no site is named. Every name found is resolved forward again, because a certificate lists the names it was issued for, not the ones still hosted.',

  /* ---- stages ---- */
  stage_resolve: 'resolving the address',
  stage_block: 'working out the block',
  stage_reverse: 'reading reverse DNS',
  stage_certificates: 'collecting certificates',
  stage_passive: 'asking the indexes',
  stage_verify: 'confirming each name',
  stage_summary: 'putting it together',

  /* ---- cards ---- */
  card_address: 'This address',
  card_block: 'The block',
  card_registry: 'Registry',
  card_routing: 'Routing',
  card_here: 'Sites at this address',
  card_neighbors: 'Neighbours in the block',
  card_candidates: 'Blocks this address belongs to',
  card_unconfirmed: 'Claimed but not confirmed',

  /* ---- row labels ---- */
  k_names_here: 'Sites confirmed here',
  k_shared: 'Shared address',
  k_ptr: 'Reverse DNS',
  k_cert_subject: 'Certificate subject',
  k_cert_issuer: 'Issued by',
  k_server: 'Server header',
  k_block: 'Block examined',
  k_block_source: 'Chosen because',
  k_range: 'Range',
  k_swept: 'Addresses walked',
  k_with_ptr: 'With reverse DNS',
  k_responded: 'Answered on 443',
  k_net_name: 'Network name',
  k_holder: 'Held by',
  k_net_range: 'Allocation',
  k_country: 'Country',
  k_rir: 'Registry',
  k_registered: 'Registered',
  k_abuse: 'Abuse contact',
  k_asn: 'Autonomous system',
  k_as_name: 'Operator',
  k_routed_prefix: 'Routed prefix',
  k_allocated: 'Allocated',

  /* ---- table headings ---- */
  th_name: 'Name',
  th_sources: 'Found in',
  th_status: 'Confirmation',
  th_address: 'Address',
  th_ptr: 'Reverse DNS',
  th_names: 'Sites',
  th_server: 'Server',
  th_block: 'Block',
  th_source: 'Source',
  th_size: 'Addresses',
  th_holder: 'Held by',
  th_points_at: 'Now points at',

  /* ---- empty states ---- */
  empty_here: 'No name resolves to this address. That is the normal answer for infrastructure — a resolver, a mail relay, a NAT gateway — and for a site that sits behind a proxy.',
  empty_cdn: 'This is a CDN edge. Millions of unrelated sites answer on it, so the question has no useful answer here.',
  empty_neighbors: 'Nothing in the block answered and nothing has reverse DNS.',
  empty_unconfirmed: 'Every name found is currently served by this address.',
  empty_flags: 'Nothing worth pointing out.',

  /* The shared wording withholds a grade; this service does not have one. */
  incomplete_body: 'Some of the checks did not get an answer, and nothing below was guessed to fill the gap. What is missing:',

  /* ---- notes ---- */
  note_address: 'Only names that resolve to this address right now are counted. What a certificate lists is a claim about when it was issued.',
  note_block: 'The block walked is the widest one that fits inside the sweep limit. Wider blocks are described below but not walked.',
  note_routing: 'The routed prefix comes from the global routing table by way of Team Cymru, and is usually wider than the registry allocation.',
  note_here: 'Sources are where the name was first seen. Confirmation is a fresh A or AAAA lookup made after that.',
  note_neighbors: 'One TCP connection per address, to port 443, with no site named — which is what makes a server show its default certificate.',
  note_candidates: 'Three different answers to "the same subnet", none of them wrong. The registry says who owns the address, routing says whose network carries it, and the /24 is the unit hosting is sold in.',
  note_unconfirmed: 'Names some source connects to this address that DNS no longer does. Usually a site that moved, sometimes a certificate issued for a domain that was never hosted here.',

  /* ---- values ---- */
  v_this_one: 'the one you asked about',
  v_uncountable: 'too many to count',

  /* ---- confirmation status ---- */
  nst_confirmed: 'served here',
  nst_in_block: 'elsewhere in the block',
  nst_moved: 'moved away',
  nst_unresolved: 'no longer resolves',
  nst_wildcard: 'wildcard, nothing to resolve',
  nst_unchecked: 'not checked',

  /* ---- why a block was chosen ---- */
  bsrc_registry: 'the registry allocation',
  bsrc_routing: 'the routed prefix',
  bsrc_conventional: 'the conventional /24',
  bsrc_requested: 'you asked for it',

  /* ---- where a name came from ---- */
  src_ptr: 'reverse DNS',
  src_certificate: 'certificate',
  src_redirect: 'redirect',
  src_ct: 'certificate transparency',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  /* ---- what could not be established ---- */
  inc_registry: 'the registry did not answer',
  inc_routing: 'the routing lookup did not answer',
  inc_sweep: 'the block could not be walked',
  inc_certificates: 'certificates were not collected',
  inc_reverse_ip: 'no reverse-IP index answered',
  inc_verification: 'names could not be confirmed in time',
  inc_verification_truncated: 'more candidates than the verification limit',

  /* ---- errors of this service ---- */
  err_invalid_prefix: 'That prefix length is not a number between 0 and the width of the address family.',
  err_block_too_large: 'That block holds more addresses than one scan may walk. Ask for a narrower prefix.',

  /* ---- findings ---- */
  flag_cdn_edge: 'A CDN edge, not a host',
  fd_cdn_edge: 'The address belongs to a content delivery network, where one address fronts an enormous number of unrelated sites. Neighbourhood says nothing about ownership here, so the indexes are not asked.',

  flag_shared_address: 'Several sites share this address',
  fd_shared_address: 'More than three names resolve here right now. That is shared hosting or a reverse proxy, and everything on it shares an IP reputation, a rate limit and whatever gets it blocked.',

  flag_no_names_confirmed: 'No name resolves here',
  fd_no_names_confirmed: 'Nothing found could be confirmed against DNS. Infrastructure that is never named, an address behind a proxy, and an address nobody indexes all look like this.',

  flag_stale_claims: 'Most of what is claimed has moved',
  fd_stale_claims: 'The sources name more sites that left than sites that stayed. Old certificates and stale reverse-IP indexes both do this, and it is worth knowing before quoting a number from either.',

  flag_no_reverse_dns: 'Nothing in the block has reverse DNS',
  fd_no_reverse_dns: 'Not one address in the block answers a PTR query. Common for cloud ranges handed out by the minute, and it removes the cheapest way of telling who runs what.',

  flag_single_operator: 'One operator across the block',
  fd_single_operator: 'Every reverse name in the block ends in the same domain, so the whole range is run by one company rather than split between customers.',

  flag_block_wider_than_sweep: 'The real block is wider than what was walked',
  fd_block_wider_than_sweep: 'The registry or the routing table puts this address in a range larger than one scan may walk, so the neighbours listed are a slice of it rather than all of it.',

  flag_block_not_enumerable: 'An IPv6 block cannot be walked',
  fd_block_not_enumerable: 'A /64 holds eighteen quintillion addresses, which is why address scanning does not exist on IPv6. Only what the indexes and the certificate logs already know can be reported.',

  flag_block_too_large: 'Block too large to walk',
  fd_block_too_large: 'The block containing this address holds more addresses than one scan may open connections to, so it was narrowed to the sweep limit.',

  flag_probing_disabled: 'Certificates were not collected',
  fd_probing_disabled: 'The active step is switched off, so this report is built from reverse DNS and public indexes alone. That is the quieter half and the less complete one.',

  flag_no_reverse_ip_source: 'No reverse-IP index answered',
  fd_no_reverse_ip_source: 'Nothing outside this scan contributed names, so anything hosted here without a certificate and without reverse DNS is invisible to it.',

  flag_providers_available: 'More sources could be switched on',
  fd_providers_available: 'This deployment has reverse-IP providers it could use and no API key for them. With one configured, coverage of shared hosting improves considerably.',
};

OWN.ru = {
  title: 'Соседи по IP — кто ещё живёт на этом адресе и в его подсети',
  title_short: 'Соседи по IP',
  h1: 'Соседи по IP',
  subtitle: 'Всё остальное, что живёт на адресе и в блоке вокруг него: обратный DNS, имена в сертификатах, реестр и таблица маршрутизации — а каждое имя перепроверяется прямым запросом, прежде чем попасть в список соседей',
  ph_host: '8.8.8.8',
  hero_label: 'Проверяемый адрес',
  hero_count: 'сайтов на адресе',
  badge_cdn: 'узел CDN',
  empty_hint: 'Введите IP-адрес, блок в виде 8.8.8.0-24 или доменное имя. Сначала проверка определяет, в какой блок входит адрес: выделение из реестра, анонсируемый префикс и /24 совпадают редко. Затем она читает обратный DNS каждого адреса блока и сертификат, который тот показывает, если не назвать сайт. Каждое найденное имя проверяется прямым запросом — в сертификате перечислено то, на что его выписали, а не то, что живёт здесь сегодня.',

  /* ---- stages ---- */
  stage_resolve: 'определяем адрес',
  stage_block: 'определяем блок',
  stage_reverse: 'читаем обратный DNS',
  stage_certificates: 'собираем сертификаты',
  stage_passive: 'спрашиваем индексы',
  stage_verify: 'подтверждаем имена',
  stage_summary: 'собираем отчёт',

  /* ---- cards ---- */
  card_address: 'Этот адрес',
  card_block: 'Блок',
  card_registry: 'Реестр',
  card_routing: 'Маршрутизация',
  card_here: 'Сайты на этом адресе',
  card_neighbors: 'Соседи по блоку',
  card_candidates: 'Блоки, в которые входит адрес',
  card_unconfirmed: 'Заявлено, но не подтверждено',

  /* ---- row labels ---- */
  k_names_here: 'Подтверждённых сайтов',
  k_shared: 'Общий адрес',
  k_ptr: 'Обратный DNS',
  k_cert_subject: 'Субъект сертификата',
  k_cert_issuer: 'Кем выпущен',
  k_server: 'Заголовок Server',
  k_block: 'Обойдённый блок',
  k_block_source: 'Почему выбран',
  k_range: 'Диапазон',
  k_swept: 'Обойдено адресов',
  k_with_ptr: 'С обратным DNS',
  k_responded: 'Ответили на 443',
  k_net_name: 'Имя сети',
  k_holder: 'Владелец',
  k_net_range: 'Выделенный блок',
  k_country: 'Страна',
  k_rir: 'Регистратор',
  k_registered: 'Дата регистрации',
  k_abuse: 'Контакт для жалоб',
  k_asn: 'Автономная система',
  k_as_name: 'Оператор',
  k_routed_prefix: 'Анонсируемый префикс',
  k_allocated: 'Дата выделения',

  /* ---- table headings ---- */
  th_name: 'Имя',
  th_sources: 'Найдено в',
  th_status: 'Подтверждение',
  th_address: 'Адрес',
  th_ptr: 'Обратный DNS',
  th_names: 'Сайты',
  th_server: 'Сервер',
  th_block: 'Блок',
  th_source: 'Источник',
  th_size: 'Адресов',
  th_points_at: 'Сейчас указывает на',
  th_holder: 'Владелец',

  /* ---- empty states ---- */
  empty_here: 'Ни одно имя не разрешается в этот адрес. Так обычно и выглядит инфраструктура — резолвер, почтовый релей, NAT-шлюз, — а ещё сайт, который стоит за прокси.',
  empty_cdn: 'Это узел CDN. На нём отвечают миллионы никак не связанных сайтов, так что здесь у этого вопроса нет полезного ответа.',
  empty_neighbors: 'Никто в блоке не ответил, и обратного DNS ни у кого нет.',
  empty_unconfirmed: 'Все найденные имена этот адрес обслуживает и сейчас.',
  empty_flags: 'Отмечать нечего.',
  incomplete_body: 'Часть проверок осталась без ответа, и пробелы ничем не заполнялись. Чего не хватает:',

  /* ---- notes ---- */
  note_address: 'Считаются только имена, которые разрешаются в этот адрес прямо сейчас. То, что перечислено в сертификате, говорит о моменте его выпуска, а не о сегодняшнем дне.',
  note_block: 'Обходится самый широкий блок, который укладывается в лимит. Блоки шире описаны ниже, но не обходятся.',
  note_routing: 'Анонсируемый префикс взят из глобальной таблицы маршрутизации через Team Cymru и обычно шире, чем выделение из реестра.',
  note_here: 'Источник — то, где имя встретилось впервые. Подтверждение — свежий запрос A или AAAA, сделанный уже после этого.',
  note_neighbors: 'Одно TCP-соединение на адрес, порт 443, и сайт не называется — именно поэтому сервер показывает сертификат по умолчанию.',
  note_candidates: 'Три разных ответа на вопрос «та же подсеть», и ни один из них не ошибочный. Реестр говорит, чей это адрес; маршрутизация — чья сеть его анонсирует; а /24 — это единица, которой торгуют хостеры.',
  note_unconfirmed: 'Имена, которые какой-то источник связывает с этим адресом, а DNS уже нет. Обычно сайт переехал; иногда сертификат выписан на домен, который здесь никогда не жил.',

  /* ---- values ---- */
  v_this_one: 'искомый адрес',
  v_uncountable: 'не сосчитать',

  /* ---- confirmation status ---- */
  nst_confirmed: 'обслуживается здесь',
  nst_in_block: 'на другом адресе блока',
  nst_moved: 'переехал',
  nst_unresolved: 'больше не разрешается',
  nst_wildcard: 'маска — разрешать нечего',
  nst_unchecked: 'не проверялось',

  /* ---- why a block was chosen ---- */
  bsrc_registry: 'выделение из реестра',
  bsrc_routing: 'анонсируемый префикс',
  bsrc_conventional: 'общепринятый /24',
  bsrc_requested: 'задан в запросе',

  /* ---- where a name came from ---- */
  src_ptr: 'обратный DNS',
  src_certificate: 'сертификат',
  src_redirect: 'редирект',
  src_ct: 'Certificate Transparency',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  /* ---- what could not be established ---- */
  inc_registry: 'реестр не ответил',
  inc_routing: 'запрос маршрутизации не ответил',
  inc_sweep: 'не удалось обойти блок',
  inc_certificates: 'сертификаты не собирались',
  inc_reverse_ip: 'ни один reverse-IP-индекс не ответил',
  inc_verification: 'имена не успели подтвердиться',
  inc_verification_truncated: 'кандидатов больше, чем лимит подтверждения',

  /* ---- errors of this service ---- */
  err_invalid_prefix: 'Длина префикса должна быть числом от 0 до разрядности адреса.',
  err_block_too_large: 'В этом блоке больше адресов, чем можно обойти за одну проверку. Запросите префикс поуже.',

  /* ---- findings ---- */
  flag_cdn_edge: 'Это узел CDN, а не хост',
  fd_cdn_edge: 'Адрес принадлежит сети доставки контента, где за одним адресом стоит огромное число никак не связанных сайтов. Соседство здесь ничего не говорит о принадлежности, поэтому индексы не опрашивались.',

  flag_shared_address: 'Адрес делят несколько сайтов',
  fd_shared_address: 'Прямо сейчас сюда разрешается больше трёх имён. Это шаред-хостинг или обратный прокси: всё, что на нём стоит, делит общую репутацию адреса, общие ограничения на частоту запросов и любую блокировку, которую заработает кто-то из соседей.',

  flag_no_names_confirmed: 'Ни одно имя сюда не разрешается',
  fd_no_names_confirmed: 'Ничего из найденного не удалось подтвердить через DNS. Так выглядит и инфраструктура, которую никто не зовёт по имени, и адрес за прокси, и адрес, которого нет ни в одном индексе.',

  flag_stale_claims: 'Большая часть заявленного переехала',
  fd_stale_claims: 'Источники называют больше уехавших сайтов, чем оставшихся. Так ведут себя и старые сертификаты, и устаревшие reverse-IP-индексы: стоит помнить об этом, прежде чем ссылаться на число из любого из них.',

  flag_no_reverse_dns: 'Во всём блоке нет обратного DNS',
  fd_no_reverse_dns: 'Ни один адрес блока не отвечает на PTR-запрос. Обычное дело для облачных диапазонов, которые выдаются поминутно, — и это отнимает самый дешёвый способ понять, кто чем управляет.',

  flag_single_operator: 'Весь блок под одним оператором',
  fd_single_operator: 'Все обратные имена в блоке заканчиваются одним доменом — значит, диапазон целиком ведёт одна компания, а не поделён между клиентами.',

  flag_block_wider_than_sweep: 'Настоящий блок шире обойдённого',
  fd_block_wider_than_sweep: 'Реестр или таблица маршрутизации помещают адрес в диапазон шире того, который можно обойти за одну проверку. Значит, перечисленные соседи — лишь его часть, а не весь список.',

  flag_block_not_enumerable: 'Блок IPv6 обойти нельзя',
  fd_block_not_enumerable: 'В /64 восемнадцать квинтиллионов адресов — поэтому сканирования адресов в IPv6 попросту не существует. Показать можно только то, что уже знают индексы и журналы сертификатов.',

  flag_block_too_large: 'Блок слишком велик, чтобы его обойти',
  fd_block_too_large: 'В блоке с этим адресом больше адресов, чем допускает одна проверка, поэтому его сузили до лимита обхода.',

  flag_probing_disabled: 'Сертификаты не собирались',
  fd_probing_disabled: 'Активный шаг выключен, и отчёт собран только из обратного DNS и публичных индексов. Это более тихая половина работы — и менее полная.',

  flag_no_reverse_ip_source: 'Ни один reverse-IP-индекс не ответил',
  fd_no_reverse_ip_source: 'Ни один внешний источник не дал имён. Значит, всё, что живёт здесь без сертификата и без обратного DNS, для этой проверки невидимо.',

  flag_providers_available: 'Можно подключить больше источников',
  fd_providers_available: 'Этот экземпляр умеет спрашивать reverse-IP-провайдеров, но ключ API для них не задан. С ключом покрытие шаред-хостинга заметно вырастет.',
};

OWN.es = {
  title: 'Vecinos de IP — qué más vive en esta dirección y en su bloque',
  title_short: 'Vecinos de IP',
  h1: 'Vecinos de IP',
  subtitle: 'Todo lo demás que vive en una dirección y en el bloque que la rodea: DNS inverso, los nombres de cada certificado, el registro y la tabla de enrutamiento — y cada nombre resuelto de nuevo hacia delante antes de llamarlo vecino',
  ph_host: '8.8.8.8',
  hero_label: 'Dirección examinada',
  hero_count: 'sitios aquí',
  badge_cdn: 'nodo CDN',
  empty_hint: 'Introduzca una dirección IP, un bloque como 8.8.8.0-24 o un nombre de dominio. La comprobación averigua primero a qué bloque pertenece la dirección — la asignación del registro, el prefijo anunciado y el /24 rara vez coinciden —, luego lee el DNS inverso de cada dirección y el certificado que cada una presenta cuando no se nombra ningún sitio. Cada nombre encontrado se resuelve de nuevo: un certificado enumera los nombres para los que se emitió, no los que siguen alojados.',

  stage_resolve: 'resolviendo la dirección',
  stage_block: 'determinando el bloque',
  stage_reverse: 'leyendo el DNS inverso',
  stage_certificates: 'recogiendo certificados',
  stage_passive: 'consultando los índices',
  stage_verify: 'confirmando cada nombre',
  stage_summary: 'componiendo el informe',

  card_address: 'Esta dirección',
  card_block: 'El bloque',
  card_registry: 'Registro',
  card_routing: 'Enrutamiento',
  card_here: 'Sitios en esta dirección',
  card_neighbors: 'Vecinos del bloque',
  card_candidates: 'Bloques a los que pertenece',
  card_unconfirmed: 'Reclamado pero no confirmado',

  k_names_here: 'Sitios confirmados aquí',
  k_shared: 'Dirección compartida',
  k_ptr: 'DNS inverso',
  k_cert_subject: 'Sujeto del certificado',
  k_cert_issuer: 'Emitido por',
  k_server: 'Cabecera Server',
  k_block: 'Bloque examinado',
  k_block_source: 'Elegido porque',
  k_range: 'Rango',
  k_swept: 'Direcciones recorridas',
  k_with_ptr: 'Con DNS inverso',
  k_responded: 'Respondieron en 443',
  k_net_name: 'Nombre de la red',
  k_holder: 'Titular',
  k_net_range: 'Asignación',
  k_country: 'País',
  k_rir: 'Registro regional',
  k_registered: 'Registrado',
  k_abuse: 'Contacto de abuso',
  k_asn: 'Sistema autónomo',
  k_as_name: 'Operador',
  k_routed_prefix: 'Prefijo anunciado',
  k_allocated: 'Asignado',

  th_name: 'Nombre',
  th_sources: 'Encontrado en',
  th_status: 'Confirmación',
  th_address: 'Dirección',
  th_ptr: 'DNS inverso',
  th_names: 'Sitios',
  th_server: 'Servidor',
  th_block: 'Bloque',
  th_source: 'Fuente',
  th_size: 'Direcciones',
  th_holder: 'Titular',
  th_points_at: 'Ahora apunta a',

  empty_here: 'Ningún nombre resuelve a esta dirección. Es la respuesta normal para infraestructura — un resolvedor, un relé de correo, una pasarela NAT — y para un sitio detrás de un proxy.',
  empty_cdn: 'Es un nodo de CDN. Sobre él responden millones de sitios sin relación entre sí, así que la pregunta no tiene aquí una respuesta útil.',
  empty_neighbors: 'Nada en el bloque respondió y nadie tiene DNS inverso.',
  empty_unconfirmed: 'Todos los nombres encontrados los sirve esta dirección ahora mismo.',
  empty_flags: 'Nada que señalar.',

  /* The shared wording withholds a grade; this service does not have one. */
  incomplete_body: 'Algunas comprobaciones no obtuvieron respuesta, y nada de lo de abajo se ha supuesto para rellenar el hueco. Lo que falta:',

  note_address: 'Solo se cuentan los nombres que resuelven a esta dirección ahora mismo. Lo que enumera un certificado es una afirmación sobre el momento de su emisión.',
  note_block: 'Se recorre el bloque más ancho que cabe en el límite de barrido. Los más anchos se describen abajo, pero no se recorren.',
  note_routing: 'El prefijo anunciado procede de la tabla de enrutamiento global vía Team Cymru y suele ser más ancho que la asignación del registro.',
  note_here: 'La fuente es donde se vio el nombre por primera vez. La confirmación es una consulta A o AAAA hecha después.',
  note_neighbors: 'Una conexión TCP por dirección, al puerto 443, sin nombrar ningún sitio — que es lo que hace que un servidor muestre su certificado por defecto.',
  note_candidates: 'Tres respuestas distintas a «la misma subred», y ninguna es errónea. El registro dice de quién es la dirección, el enrutamiento de quién es la red que la lleva, y el /24 es la unidad con la que se vende el alojamiento.',
  note_unconfirmed: 'Nombres que alguna fuente asocia a esta dirección y el DNS ya no. Normalmente un sitio que se mudó; a veces un certificado emitido para un dominio que nunca se alojó aquí.',

  v_this_one: 'la que preguntó',
  v_uncountable: 'incontables',

  nst_confirmed: 'servido aquí',
  nst_in_block: 'en otro punto del bloque',
  nst_moved: 'se mudó',
  nst_unresolved: 'ya no resuelve',
  nst_wildcard: 'comodín, nada que resolver',
  nst_unchecked: 'sin comprobar',

  bsrc_registry: 'la asignación del registro',
  bsrc_routing: 'el prefijo anunciado',
  bsrc_conventional: 'el /24 convencional',
  bsrc_requested: 'usted lo pidió',

  src_ptr: 'DNS inverso',
  src_certificate: 'certificado',
  src_redirect: 'redirección',
  src_ct: 'Certificate Transparency',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  inc_registry: 'el registro no respondió',
  inc_routing: 'la consulta de enrutamiento no respondió',
  inc_sweep: 'no se pudo recorrer el bloque',
  inc_certificates: 'no se recogieron certificados',
  inc_reverse_ip: 'ningún índice reverse-IP respondió',
  inc_verification: 'no dio tiempo a confirmar los nombres',
  inc_verification_truncated: 'más candidatos que el límite de verificación',

  err_invalid_prefix: 'La longitud del prefijo debe ser un número entre 0 y el ancho de la familia de direcciones.',
  err_block_too_large: 'Ese bloque contiene más direcciones de las que puede recorrer una comprobación. Pida un prefijo más estrecho.',

  flag_cdn_edge: 'Un nodo CDN, no un host',
  fd_cdn_edge: 'La dirección pertenece a una red de distribución de contenido, donde una sola dirección da la cara por un número enorme de sitios sin relación. Aquí la vecindad no dice nada sobre la propiedad, así que no se consultan los índices.',

  flag_shared_address: 'Varios sitios comparten esta dirección',
  fd_shared_address: 'Más de tres nombres resuelven aquí ahora mismo. Eso es alojamiento compartido o un proxy inverso, y todo lo que hay encima comparte la reputación de la IP, el límite de tasa y cualquier bloqueo que se gane un vecino.',

  flag_no_names_confirmed: 'Ningún nombre resuelve aquí',
  fd_no_names_confirmed: 'Nada de lo encontrado pudo confirmarse contra el DNS. Así se ve la infraestructura que nadie nombra, una dirección tras un proxy y una dirección que nadie indexa.',

  flag_stale_claims: 'Casi todo lo reclamado se ha mudado',
  fd_stale_claims: 'Las fuentes nombran más sitios que se fueron que sitios que se quedaron. Los certificados viejos y los índices reverse-IP desactualizados hacen esto, y conviene saberlo antes de citar una cifra de cualquiera de los dos.',

  flag_no_reverse_dns: 'Nada en el bloque tiene DNS inverso',
  fd_no_reverse_dns: 'Ni una dirección del bloque responde a una consulta PTR. Es habitual en rangos de nube repartidos por minutos, y elimina la forma más barata de saber quién gestiona qué.',

  flag_single_operator: 'Un solo operador en todo el bloque',
  fd_single_operator: 'Todos los nombres inversos del bloque terminan en el mismo dominio, así que el rango entero lo lleva una sola empresa en lugar de estar repartido entre clientes.',

  flag_block_wider_than_sweep: 'El bloque real es más ancho que lo recorrido',
  fd_block_wider_than_sweep: 'El registro o la tabla de enrutamiento sitúan esta dirección en un rango mayor del que puede recorrer una comprobación, así que los vecinos listados son una parte y no la totalidad.',

  flag_block_not_enumerable: 'Un bloque IPv6 no se puede recorrer',
  fd_block_not_enumerable: 'Un /64 contiene dieciocho trillones de direcciones, y por eso el escaneo de direcciones no existe en IPv6. Solo puede informarse de lo que ya saben los índices y los registros de certificados.',

  flag_block_too_large: 'Bloque demasiado grande para recorrer',
  fd_block_too_large: 'El bloque que contiene esta dirección tiene más direcciones de las que una comprobación puede abrir conexiones, así que se redujo al límite de barrido.',

  flag_probing_disabled: 'No se recogieron certificados',
  fd_probing_disabled: 'El paso activo está desactivado, de modo que este informe se construye solo con DNS inverso e índices públicos. Es la mitad más silenciosa y la menos completa.',

  flag_no_reverse_ip_source: 'Ningún índice reverse-IP respondió',
  fd_no_reverse_ip_source: 'Nada ajeno a esta comprobación aportó nombres, así que lo que esté alojado aquí sin certificado y sin DNS inverso le resulta invisible.',

  flag_providers_available: 'Se pueden activar más fuentes',
  fd_providers_available: 'Esta instalación tiene proveedores reverse-IP sin clave de API configurada. Con una configurada, la cobertura del alojamiento compartido mejora bastante.',
};

OWN.pt = {
  title: 'Vizinhos de IP — o que mais vive neste endereço e no seu bloco',
  title_short: 'Vizinhos de IP',
  h1: 'Vizinhos de IP',
  subtitle: 'Tudo o mais que vive num endereço e no bloco à sua volta: DNS reverso, os nomes de cada certificado, o registro e a tabela de roteamento — e cada nome resolvido de novo para a frente antes de ser chamado de vizinho',
  ph_host: '8.8.8.8',
  hero_label: 'Endereço examinado',
  hero_count: 'sites aqui',
  badge_cdn: 'nó de CDN',
  empty_hint: 'Informe um endereço IP, um bloco como 8.8.8.0-24 ou um nome de domínio. A verificação descobre primeiro a que bloco o endereço pertence — a alocação do registro, o prefixo anunciado e o /24 raramente coincidem —, depois lê o DNS reverso de cada endereço e o certificado que cada um apresenta quando nenhum site é nomeado. Cada nome encontrado é resolvido de novo: um certificado lista os nomes para os quais foi emitido, não os que continuam hospedados.',

  stage_resolve: 'resolvendo o endereço',
  stage_block: 'determinando o bloco',
  stage_reverse: 'lendo o DNS reverso',
  stage_certificates: 'coletando certificados',
  stage_passive: 'consultando os índices',
  stage_verify: 'confirmando cada nome',
  stage_summary: 'montando o relatório',

  card_address: 'Este endereço',
  card_block: 'O bloco',
  card_registry: 'Registro',
  card_routing: 'Roteamento',
  card_here: 'Sites neste endereço',
  card_neighbors: 'Vizinhos do bloco',
  card_candidates: 'Blocos a que o endereço pertence',
  card_unconfirmed: 'Alegado mas não confirmado',

  k_names_here: 'Sites confirmados aqui',
  k_shared: 'Endereço compartilhado',
  k_ptr: 'DNS reverso',
  k_cert_subject: 'Sujeito do certificado',
  k_cert_issuer: 'Emitido por',
  k_server: 'Cabeçalho Server',
  k_block: 'Bloco examinado',
  k_block_source: 'Escolhido porque',
  k_range: 'Faixa',
  k_swept: 'Endereços percorridos',
  k_with_ptr: 'Com DNS reverso',
  k_responded: 'Responderam na 443',
  k_net_name: 'Nome da rede',
  k_holder: 'Titular',
  k_net_range: 'Alocação',
  k_country: 'País',
  k_rir: 'Registro regional',
  k_registered: 'Registrado',
  k_abuse: 'Contato de abuso',
  k_asn: 'Sistema autônomo',
  k_as_name: 'Operador',
  k_routed_prefix: 'Prefixo anunciado',
  k_allocated: 'Alocado',

  th_name: 'Nome',
  th_sources: 'Encontrado em',
  th_status: 'Confirmação',
  th_address: 'Endereço',
  th_ptr: 'DNS reverso',
  th_names: 'Sites',
  th_server: 'Servidor',
  th_block: 'Bloco',
  th_source: 'Fonte',
  th_size: 'Endereços',
  th_holder: 'Titular',
  th_points_at: 'Agora aponta para',

  empty_here: 'Nenhum nome resolve para este endereço. É a resposta normal para infraestrutura — um resolvedor, um relay de e-mail, um gateway NAT — e para um site atrás de um proxy.',
  empty_cdn: 'Isto é um nó de CDN. Milhões de sites sem relação respondem nele, então a pergunta não tem resposta útil aqui.',
  empty_neighbors: 'Nada no bloco respondeu e ninguém tem DNS reverso.',
  empty_unconfirmed: 'Todos os nomes encontrados são servidos por este endereço agora mesmo.',
  empty_flags: 'Nada a assinalar.',

  /* The shared wording withholds a grade; this service does not have one. */
  incomplete_body: 'Algumas verificações não obtiveram resposta, e nada abaixo foi presumido para preencher a lacuna. O que falta:',

  note_address: 'Só contam os nomes que resolvem para este endereço agora. O que um certificado lista é uma afirmação sobre o momento da emissão.',
  note_block: 'Percorre-se o bloco mais largo que cabe no limite da varredura. Blocos maiores são descritos abaixo, mas não percorridos.',
  note_routing: 'O prefixo anunciado vem da tabela de roteamento global via Team Cymru e costuma ser mais largo que a alocação do registro.',
  note_here: 'A fonte é onde o nome apareceu primeiro. A confirmação é uma consulta A ou AAAA feita depois.',
  note_neighbors: 'Uma conexão TCP por endereço, na porta 443, sem nomear nenhum site — é isso que faz um servidor mostrar o certificado padrão.',
  note_candidates: 'Três respostas diferentes para «a mesma sub-rede», e nenhuma errada. O registro diz de quem é o endereço, o roteamento de quem é a rede que o carrega, e o /24 é a unidade em que a hospedagem é vendida.',
  note_unconfirmed: 'Nomes que alguma fonte liga a este endereço e o DNS já não. Normalmente um site que mudou; às vezes um certificado emitido para um domínio que nunca esteve aqui.',

  v_this_one: 'o endereço perguntado',
  v_uncountable: 'incontáveis',

  nst_confirmed: 'servido aqui',
  nst_in_block: 'em outro ponto do bloco',
  nst_moved: 'mudou-se',
  nst_unresolved: 'já não resolve',
  nst_wildcard: 'curinga, nada a resolver',
  nst_unchecked: 'não verificado',

  bsrc_registry: 'a alocação do registro',
  bsrc_routing: 'o prefixo anunciado',
  bsrc_conventional: 'o /24 convencional',
  bsrc_requested: 'você pediu',

  src_ptr: 'DNS reverso',
  src_certificate: 'certificado',
  src_redirect: 'redirecionamento',
  src_ct: 'Certificate Transparency',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  inc_registry: 'o registro não respondeu',
  inc_routing: 'a consulta de roteamento não respondeu',
  inc_sweep: 'não foi possível percorrer o bloco',
  inc_certificates: 'certificados não foram coletados',
  inc_reverse_ip: 'nenhum índice reverse-IP respondeu',
  inc_verification: 'não deu tempo de confirmar os nomes',
  inc_verification_truncated: 'mais candidatos que o limite de verificação',

  err_invalid_prefix: 'O comprimento do prefixo deve ser um número entre 0 e a largura da família de endereços.',
  err_block_too_large: 'Esse bloco tem mais endereços do que uma verificação pode percorrer. Peça um prefixo mais estreito.',

  flag_cdn_edge: 'Um nó de CDN, não um host',
  fd_cdn_edge: 'O endereço pertence a uma rede de distribuição de conteúdo, onde um único endereço responde por um número enorme de sites sem relação. Aqui a vizinhança nada diz sobre propriedade, então os índices não são consultados.',

  flag_shared_address: 'Vários sites dividem este endereço',
  fd_shared_address: 'Mais de três nomes resolvem para cá agora. Isso é hospedagem compartilhada ou um proxy reverso, e tudo que está nele divide a reputação do IP, o limite de taxa e qualquer bloqueio que um vizinho conquiste.',

  flag_no_names_confirmed: 'Nenhum nome resolve para cá',
  fd_no_names_confirmed: 'Nada do que foi encontrado pôde ser confirmado no DNS. É assim que se parece a infraestrutura que ninguém nomeia, um endereço atrás de um proxy e um endereço que ninguém indexa.',

  flag_stale_claims: 'A maior parte do alegado se mudou',
  fd_stale_claims: 'As fontes nomeiam mais sites que saíram do que sites que ficaram. Certificados antigos e índices reverse-IP desatualizados fazem isso, e vale saber antes de citar um número de qualquer um deles.',

  flag_no_reverse_dns: 'Nada no bloco tem DNS reverso',
  fd_no_reverse_dns: 'Nenhum endereço do bloco responde a uma consulta PTR. Comum em faixas de nuvem distribuídas por minuto, e elimina a forma mais barata de saber quem administra o quê.',

  flag_single_operator: 'Um único operador em todo o bloco',
  fd_single_operator: 'Todos os nomes reversos do bloco terminam no mesmo domínio, ou seja, a faixa inteira é operada por uma empresa em vez de dividida entre clientes.',

  flag_block_wider_than_sweep: 'O bloco real é mais largo que o percorrido',
  fd_block_wider_than_sweep: 'O registro ou a tabela de roteamento colocam este endereço numa faixa maior do que uma verificação pode percorrer, então os vizinhos listados são uma fatia e não o todo.',

  flag_block_not_enumerable: 'Um bloco IPv6 não pode ser percorrido',
  fd_block_not_enumerable: 'Um /64 contém dezoito quintilhões de endereços, e é por isso que varredura de endereços não existe em IPv6. Só se pode relatar o que os índices e os logs de certificados já sabem.',

  flag_block_too_large: 'Bloco grande demais para percorrer',
  fd_block_too_large: 'O bloco que contém este endereço tem mais endereços do que uma verificação pode conectar, então foi estreitado até o limite da varredura.',

  flag_probing_disabled: 'Certificados não foram coletados',
  fd_probing_disabled: 'O passo ativo está desligado, então este relatório é montado só com DNS reverso e índices públicos. É a metade mais silenciosa e a menos completa.',

  flag_no_reverse_ip_source: 'Nenhum índice reverse-IP respondeu',
  fd_no_reverse_ip_source: 'Nada além desta verificação contribuiu com nomes, então o que estiver hospedado aqui sem certificado e sem DNS reverso é invisível para ela.',

  flag_providers_available: 'Mais fontes podem ser ativadas',
  fd_providers_available: 'Esta instalação tem provedores reverse-IP sem chave de API configurada. Com uma configurada, a cobertura de hospedagem compartilhada melhora bastante.',
};

OWN.fr = {
  title: 'Voisins IP — qui d’autre vit à cette adresse et dans son bloc',
  title_short: 'Voisins IP',
  h1: 'Voisins IP',
  subtitle: 'Tout ce qui vit par ailleurs à une adresse et dans le bloc qui l’entoure : DNS inverse, les noms de chaque certificat, le registre et la table de routage — et chaque nom résolu à nouveau avant d’être appelé voisin',
  ph_host: '8.8.8.8',
  hero_label: 'Adresse examinée',
  hero_count: 'sites ici',
  badge_cdn: 'nœud CDN',
  empty_hint: 'Saisissez une adresse IP, un bloc sous la forme 8.8.8.0-24 ou un nom de domaine. La vérification détermine d’abord à quel bloc appartient l’adresse — l’allocation du registre, le préfixe annoncé et le /24 concordent rarement —, puis lit le DNS inverse de chaque adresse et le certificat que chacune présente lorsqu’aucun site n’est nommé. Chaque nom trouvé est résolu à nouveau : un certificat énumère les noms pour lesquels il a été émis, pas ceux qui sont encore hébergés.',

  stage_resolve: 'résolution de l’adresse',
  stage_block: 'détermination du bloc',
  stage_reverse: 'lecture du DNS inverse',
  stage_certificates: 'collecte des certificats',
  stage_passive: 'interrogation des index',
  stage_verify: 'confirmation des noms',
  stage_summary: 'assemblage du rapport',

  card_address: 'Cette adresse',
  card_block: 'Le bloc',
  card_registry: 'Registre',
  card_routing: 'Routage',
  card_here: 'Sites à cette adresse',
  card_neighbors: 'Voisins dans le bloc',
  card_candidates: 'Blocs auxquels l’adresse appartient',
  card_unconfirmed: 'Revendiqué mais non confirmé',

  k_names_here: 'Sites confirmés ici',
  k_shared: 'Adresse partagée',
  k_ptr: 'DNS inverse',
  k_cert_subject: 'Sujet du certificat',
  k_cert_issuer: 'Émis par',
  k_server: 'En-tête Server',
  k_block: 'Bloc examiné',
  k_block_source: 'Choisi parce que',
  k_range: 'Plage',
  k_swept: 'Adresses parcourues',
  k_with_ptr: 'Avec DNS inverse',
  k_responded: 'Ont répondu sur 443',
  k_net_name: 'Nom du réseau',
  k_holder: 'Titulaire',
  k_net_range: 'Allocation',
  k_country: 'Pays',
  k_rir: 'Registre régional',
  k_registered: 'Enregistré',
  k_abuse: 'Contact abus',
  k_asn: 'Système autonome',
  k_as_name: 'Opérateur',
  k_routed_prefix: 'Préfixe annoncé',
  k_allocated: 'Alloué',

  th_name: 'Nom',
  th_sources: 'Trouvé dans',
  th_status: 'Confirmation',
  th_address: 'Adresse',
  th_ptr: 'DNS inverse',
  th_names: 'Sites',
  th_server: 'Serveur',
  th_block: 'Bloc',
  th_source: 'Source',
  th_size: 'Adresses',
  th_holder: 'Titulaire',
  th_points_at: 'Pointe maintenant vers',

  empty_here: 'Aucun nom ne résout vers cette adresse. C’est la réponse normale pour de l’infrastructure — un résolveur, un relais de messagerie, une passerelle NAT — et pour un site derrière un proxy.',
  empty_cdn: 'Il s’agit d’un nœud CDN. Des millions de sites sans rapport y répondent, la question n’a donc pas de réponse utile ici.',
  empty_neighbors: 'Rien dans le bloc n’a répondu et personne n’a de DNS inverse.',
  empty_unconfirmed: 'Tous les noms trouvés sont bien servis par cette adresse en ce moment.',
  empty_flags: 'Rien à signaler.',

  /* The shared wording withholds a grade; this service does not have one. */
  incomplete_body: 'Certaines vérifications n’ont pas obtenu de réponse, et rien ci-dessous n’a été deviné pour combler le vide. Ce qui manque :',

  note_address: 'Seuls comptent les noms qui résolvent vers cette adresse à l’instant. Ce qu’énumère un certificat est une affirmation sur le moment de son émission.',
  note_block: 'Le bloc parcouru est le plus large qui tienne dans la limite de balayage. Les blocs plus larges sont décrits ci-dessous mais pas parcourus.',
  note_routing: 'Le préfixe annoncé provient de la table de routage mondiale via Team Cymru et est généralement plus large que l’allocation du registre.',
  note_here: 'La source est l’endroit où le nom est apparu en premier. La confirmation est une requête A ou AAAA faite ensuite.',
  note_neighbors: 'Une connexion TCP par adresse, sur le port 443, sans nommer de site — c’est ce qui fait qu’un serveur montre son certificat par défaut.',
  note_candidates: 'Trois réponses différentes à « le même sous-réseau », et aucune n’est fausse. Le registre dit à qui appartient l’adresse, le routage à qui appartient le réseau qui la porte, et le /24 est l’unité dans laquelle l’hébergement se vend.',
  note_unconfirmed: 'Des noms qu’une source relie à cette adresse et que le DNS ne relie plus. Généralement un site qui a déménagé ; parfois un certificat émis pour un domaine jamais hébergé ici.',

  v_this_one: 'celle demandée',
  v_uncountable: 'innombrables',

  nst_confirmed: 'servi ici',
  nst_in_block: 'ailleurs dans le bloc',
  nst_moved: 'a déménagé',
  nst_unresolved: 'ne résout plus',
  nst_wildcard: 'joker, rien à résoudre',
  nst_unchecked: 'non vérifié',

  bsrc_registry: 'l’allocation du registre',
  bsrc_routing: 'le préfixe annoncé',
  bsrc_conventional: 'le /24 conventionnel',
  bsrc_requested: 'vous l’avez demandé',

  src_ptr: 'DNS inverse',
  src_certificate: 'certificat',
  src_redirect: 'redirection',
  src_ct: 'Certificate Transparency',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  inc_registry: 'le registre n’a pas répondu',
  inc_routing: 'la requête de routage n’a pas répondu',
  inc_sweep: 'le bloc n’a pas pu être parcouru',
  inc_certificates: 'les certificats n’ont pas été collectés',
  inc_reverse_ip: 'aucun index reverse-IP n’a répondu',
  inc_verification: 'les noms n’ont pas pu être confirmés à temps',
  inc_verification_truncated: 'plus de candidats que la limite de vérification',

  err_invalid_prefix: 'La longueur de préfixe doit être un nombre entre 0 et la largeur de la famille d’adresses.',
  err_block_too_large: 'Ce bloc contient plus d’adresses qu’une vérification ne peut en parcourir. Demandez un préfixe plus étroit.',

  flag_cdn_edge: 'Un nœud CDN, pas un hôte',
  fd_cdn_edge: 'L’adresse appartient à un réseau de diffusion de contenu, où une seule adresse sert de façade à un nombre énorme de sites sans rapport. Le voisinage n’y dit rien de la propriété, les index ne sont donc pas interrogés.',

  flag_shared_address: 'Plusieurs sites partagent cette adresse',
  fd_shared_address: 'Plus de trois noms résolvent ici en ce moment. C’est de l’hébergement mutualisé ou un proxy inverse, et tout ce qui s’y trouve partage la réputation de l’IP, la limite de débit et le moindre blocage qu’un voisin se sera attiré.',

  flag_no_names_confirmed: 'Aucun nom ne résout ici',
  fd_no_names_confirmed: 'Rien de ce qui a été trouvé n’a pu être confirmé par le DNS. C’est à quoi ressemblent l’infrastructure que personne ne nomme, une adresse derrière un proxy et une adresse que personne n’indexe.',

  flag_stale_claims: 'L’essentiel de ce qui est revendiqué a déménagé',
  fd_stale_claims: 'Les sources nomment plus de sites partis que de sites restés. Les vieux certificats et les index reverse-IP périmés font cela, et il vaut mieux le savoir avant de citer un chiffre de l’un ou de l’autre.',

  flag_no_reverse_dns: 'Rien dans le bloc n’a de DNS inverse',
  fd_no_reverse_dns: 'Pas une adresse du bloc ne répond à une requête PTR. Courant pour les plages cloud attribuées à la minute, et cela supprime le moyen le moins cher de savoir qui exploite quoi.',

  flag_single_operator: 'Un seul opérateur sur tout le bloc',
  fd_single_operator: 'Tous les noms inverses du bloc se terminent par le même domaine : la plage entière est exploitée par une seule entreprise plutôt que répartie entre des clients.',

  flag_block_wider_than_sweep: 'Le bloc réel est plus large que le parcours',
  fd_block_wider_than_sweep: 'Le registre ou la table de routage placent cette adresse dans une plage plus grande qu’une vérification ne peut parcourir : les voisins listés en sont une tranche, pas la totalité.',

  flag_block_not_enumerable: 'Un bloc IPv6 ne se parcourt pas',
  fd_block_not_enumerable: 'Un /64 contient dix-huit trillions d’adresses, et c’est pourquoi le balayage d’adresses n’existe pas en IPv6. Seul ce que les index et les journaux de certificats savent déjà peut être rapporté.',

  flag_block_too_large: 'Bloc trop grand pour être parcouru',
  fd_block_too_large: 'Le bloc contenant cette adresse compte plus d’adresses qu’une vérification ne peut en contacter : il a été réduit à la limite de balayage.',

  flag_probing_disabled: 'Les certificats n’ont pas été collectés',
  fd_probing_disabled: 'L’étape active est désactivée, ce rapport n’est donc construit qu’à partir du DNS inverse et des index publics. C’est la moitié la plus discrète et la moins complète.',

  flag_no_reverse_ip_source: 'Aucun index reverse-IP n’a répondu',
  fd_no_reverse_ip_source: 'Rien d’extérieur à cette vérification n’a fourni de noms : tout ce qui est hébergé ici sans certificat et sans DNS inverse lui reste invisible.',

  flag_providers_available: 'D’autres sources pourraient être activées',
  fd_providers_available: 'Cette installation dispose de fournisseurs reverse-IP sans clé d’API configurée. Avec une clé, la couverture de l’hébergement mutualisé s’améliore nettement.',
};

OWN.de = {
  title: 'IP-Nachbarn — was sonst noch an dieser Adresse und in ihrem Block lebt',
  title_short: 'IP-Nachbarn',
  h1: 'IP-Nachbarn',
  subtitle: 'Alles Weitere, was an einer Adresse und im Block darum herum lebt: Reverse-DNS, die Namen auf jedem Zertifikat, das Register und die Routing-Tabelle — und jeder Name noch einmal vorwärts aufgelöst, bevor er Nachbar genannt wird',
  ph_host: '8.8.8.8',
  hero_label: 'Untersuchte Adresse',
  hero_count: 'Sites hier',
  badge_cdn: 'CDN-Knoten',
  empty_hint: 'Geben Sie eine IP-Adresse, einen Block als 8.8.8.0-24 oder einen Domainnamen ein. Die Prüfung ermittelt zuerst, zu welchem Block die Adresse gehört — Registerzuteilung, angekündigtes Präfix und /24 stimmen selten überein —, liest dann das Reverse-DNS jeder Adresse und das Zertifikat, das jede zeigt, wenn keine Site genannt wird. Jeder gefundene Name wird erneut aufgelöst: Ein Zertifikat führt die Namen auf, für die es ausgestellt wurde, nicht die, die noch gehostet werden.',

  stage_resolve: 'Adresse auflösen',
  stage_block: 'Block bestimmen',
  stage_reverse: 'Reverse-DNS lesen',
  stage_certificates: 'Zertifikate sammeln',
  stage_passive: 'Indizes befragen',
  stage_verify: 'Namen bestätigen',
  stage_summary: 'Bericht zusammensetzen',

  card_address: 'Diese Adresse',
  card_block: 'Der Block',
  card_registry: 'Register',
  card_routing: 'Routing',
  card_here: 'Sites an dieser Adresse',
  card_neighbors: 'Nachbarn im Block',
  card_candidates: 'Blöcke, zu denen die Adresse gehört',
  card_unconfirmed: 'Behauptet, aber nicht bestätigt',

  k_names_here: 'Hier bestätigte Sites',
  k_shared: 'Geteilte Adresse',
  k_ptr: 'Reverse-DNS',
  k_cert_subject: 'Zertifikatsinhaber',
  k_cert_issuer: 'Ausgestellt von',
  k_server: 'Server-Header',
  k_block: 'Untersuchter Block',
  k_block_source: 'Gewählt weil',
  k_range: 'Bereich',
  k_swept: 'Durchlaufene Adressen',
  k_with_ptr: 'Mit Reverse-DNS',
  k_responded: 'Antworteten auf 443',
  k_net_name: 'Netzname',
  k_holder: 'Inhaber',
  k_net_range: 'Zuteilung',
  k_country: 'Land',
  k_rir: 'Register',
  k_registered: 'Registriert',
  k_abuse: 'Abuse-Kontakt',
  k_asn: 'Autonomes System',
  k_as_name: 'Betreiber',
  k_routed_prefix: 'Angekündigtes Präfix',
  k_allocated: 'Zugeteilt',

  th_name: 'Name',
  th_sources: 'Gefunden in',
  th_status: 'Bestätigung',
  th_address: 'Adresse',
  th_ptr: 'Reverse-DNS',
  th_names: 'Sites',
  th_server: 'Server',
  th_block: 'Block',
  th_source: 'Quelle',
  th_size: 'Adressen',
  th_holder: 'Inhaber',
  th_points_at: 'Zeigt jetzt auf',

  empty_here: 'Kein Name löst auf diese Adresse auf. Das ist die normale Antwort für Infrastruktur — einen Resolver, ein Mail-Relay, ein NAT-Gateway — und für eine Site hinter einem Proxy.',
  empty_cdn: 'Das ist ein CDN-Knoten. Millionen unzusammenhängender Sites antworten darauf, die Frage hat hier also keine nützliche Antwort.',
  empty_neighbors: 'Nichts im Block hat geantwortet, und niemand hat Reverse-DNS.',
  empty_unconfirmed: 'Jeder gefundene Name wird derzeit von dieser Adresse ausgeliefert.',
  empty_flags: 'Nichts Erwähnenswertes.',

  /* The shared wording withholds a grade; this service does not have one. */
  incomplete_body: 'Einige Prüfungen bekamen keine Antwort, und nichts unten wurde geraten, um die Lücke zu füllen. Was fehlt:',

  note_address: 'Gezählt werden nur Namen, die gerade jetzt auf diese Adresse auflösen. Was ein Zertifikat auflistet, ist eine Aussage über den Zeitpunkt der Ausstellung.',
  note_block: 'Durchlaufen wird der breiteste Block, der in das Sweep-Limit passt. Breitere Blöcke werden unten beschrieben, aber nicht durchlaufen.',
  note_routing: 'Das angekündigte Präfix stammt über Team Cymru aus der globalen Routing-Tabelle und ist meist breiter als die Registerzuteilung.',
  note_here: 'Die Quelle ist, wo der Name zuerst auftauchte. Die Bestätigung ist eine danach gestellte A- oder AAAA-Abfrage.',
  note_neighbors: 'Eine TCP-Verbindung pro Adresse auf Port 443, ohne eine Site zu nennen — genau das lässt einen Server sein Standardzertifikat zeigen.',
  note_candidates: 'Drei verschiedene Antworten auf „dasselbe Subnetz“, und keine davon ist falsch. Das Register sagt, wem die Adresse gehört, das Routing, wessen Netz sie trägt, und der /24 ist die Einheit, in der Hosting verkauft wird.',
  note_unconfirmed: 'Namen, die eine Quelle mit dieser Adresse verbindet und das DNS nicht mehr. Meist eine umgezogene Site; manchmal ein Zertifikat für eine Domain, die hier nie lag.',

  v_this_one: 'die erfragte',
  v_uncountable: 'unzählbar viele',

  nst_confirmed: 'wird hier ausgeliefert',
  nst_in_block: 'anderswo im Block',
  nst_moved: 'umgezogen',
  nst_unresolved: 'löst nicht mehr auf',
  nst_wildcard: 'Wildcard, nichts aufzulösen',
  nst_unchecked: 'nicht geprüft',

  bsrc_registry: 'die Registerzuteilung',
  bsrc_routing: 'das angekündigte Präfix',
  bsrc_conventional: 'der übliche /24',
  bsrc_requested: 'Sie haben ihn verlangt',

  src_ptr: 'Reverse-DNS',
  src_certificate: 'Zertifikat',
  src_redirect: 'Weiterleitung',
  src_ct: 'Certificate Transparency',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  inc_registry: 'das Register hat nicht geantwortet',
  inc_routing: 'die Routing-Abfrage hat nicht geantwortet',
  inc_sweep: 'der Block ließ sich nicht durchlaufen',
  inc_certificates: 'Zertifikate wurden nicht gesammelt',
  inc_reverse_ip: 'kein Reverse-IP-Index hat geantwortet',
  inc_verification: 'die Namen ließen sich nicht rechtzeitig bestätigen',
  inc_verification_truncated: 'mehr Kandidaten als das Prüflimit',

  err_invalid_prefix: 'Die Präfixlänge muss eine Zahl zwischen 0 und der Breite der Adressfamilie sein.',
  err_block_too_large: 'Dieser Block enthält mehr Adressen, als ein Durchlauf abgehen darf. Fragen Sie ein engeres Präfix an.',

  flag_cdn_edge: 'Ein CDN-Knoten, kein Host',
  fd_cdn_edge: 'Die Adresse gehört zu einem Content Delivery Network, wo eine Adresse als Fassade für eine enorme Zahl unzusammenhängender Sites dient. Nachbarschaft sagt hier nichts über Eigentum, deshalb werden die Indizes nicht befragt.',

  flag_shared_address: 'Mehrere Sites teilen sich diese Adresse',
  fd_shared_address: 'Mehr als drei Namen lösen gerade hierher auf. Das ist Shared Hosting oder ein Reverse Proxy, und alles darauf teilt sich die IP-Reputation, das Rate-Limit und jede Sperre, die sich ein Nachbar einhandelt.',

  flag_no_names_confirmed: 'Kein Name löst hierher auf',
  fd_no_names_confirmed: 'Nichts von dem Gefundenen ließ sich gegen das DNS bestätigen. So sehen Infrastruktur ohne Namen, eine Adresse hinter einem Proxy und eine Adresse aus, die niemand indexiert.',

  flag_stale_claims: 'Das meiste Behauptete ist umgezogen',
  fd_stale_claims: 'Die Quellen nennen mehr abgewanderte als gebliebene Sites. Alte Zertifikate und veraltete Reverse-IP-Indizes tun das, und man sollte es wissen, bevor man eine Zahl aus einem von beiden zitiert.',

  flag_no_reverse_dns: 'Nichts im Block hat Reverse-DNS',
  fd_no_reverse_dns: 'Keine einzige Adresse des Blocks beantwortet eine PTR-Abfrage. Üblich bei minutenweise vergebenen Cloud-Bereichen — und es nimmt einem den billigsten Weg, herauszufinden, wer was betreibt.',

  flag_single_operator: 'Ein Betreiber über den ganzen Block',
  fd_single_operator: 'Alle Reverse-Namen im Block enden auf derselben Domain: Der ganze Bereich wird von einem Unternehmen betrieben statt unter Kunden aufgeteilt.',

  flag_block_wider_than_sweep: 'Der echte Block ist breiter als der Durchlauf',
  fd_block_wider_than_sweep: 'Register oder Routing-Tabelle setzen diese Adresse in einen Bereich, der größer ist als ein Durchlauf abgehen kann — die gelisteten Nachbarn sind ein Ausschnitt, nicht das Ganze.',

  flag_block_not_enumerable: 'Ein IPv6-Block lässt sich nicht durchlaufen',
  fd_block_not_enumerable: 'Ein /64 fasst achtzehn Trillionen Adressen, weshalb es Adress-Scanning unter IPv6 nicht gibt. Berichtet werden kann nur, was Indizes und Zertifikatsprotokolle ohnehin wissen.',

  flag_block_too_large: 'Block zu groß für einen Durchlauf',
  fd_block_too_large: 'Der Block mit dieser Adresse enthält mehr Adressen, als eine Prüfung Verbindungen öffnen darf, also wurde er auf das Sweep-Limit verengt.',

  flag_probing_disabled: 'Zertifikate wurden nicht gesammelt',
  fd_probing_disabled: 'Der aktive Schritt ist abgeschaltet, dieser Bericht entsteht also allein aus Reverse-DNS und öffentlichen Indizes. Das ist die leisere Hälfte — und die unvollständigere.',

  flag_no_reverse_ip_source: 'Kein Reverse-IP-Index hat geantwortet',
  fd_no_reverse_ip_source: 'Nichts außerhalb dieser Prüfung hat Namen beigesteuert; was hier ohne Zertifikat und ohne Reverse-DNS gehostet wird, bleibt ihr unsichtbar.',

  flag_providers_available: 'Weitere Quellen ließen sich zuschalten',
  fd_providers_available: 'Diese Installation kennt Reverse-IP-Anbieter, für die kein API-Schlüssel hinterlegt ist. Mit einem konfigurierten Schlüssel steigt die Abdeckung von Shared Hosting erheblich.',
};

OWN.tr = {
  title: 'IP Komşuları — bu adreste ve bloğunda başka ne yaşıyor',
  title_short: 'IP Komşuları',
  h1: 'IP Komşuları',
  subtitle: 'Bir adreste ve çevresindeki blokta yaşayan her şey: ters DNS, her sertifikadaki adlar, kayıt defteri ve yönlendirme tablosu — ve komşu denmeden önce ileri yönde yeniden çözülen her ad',
  ph_host: '8.8.8.8',
  hero_label: 'İncelenen adres',
  hero_count: 'burada site',
  badge_cdn: 'CDN düğümü',
  empty_hint: 'Bir IP adresi, 8.8.8.0-24 biçiminde bir blok ya da alan adı girin. Kontrol önce adresin hangi bloğa ait olduğunu bulur — kayıt tahsisi, duyurulan önek ve /24 nadiren örtüşür —, sonra bloktaki her adresin ters DNS kaydını ve hiçbir site adı verilmediğinde her birinin sunduğu sertifikayı okur. Bulunan her ad yeniden çözülür: sertifika, hâlâ barındırılan adları değil, kendisi için düzenlenmiş adları listeler.',

  stage_resolve: 'adres çözülüyor',
  stage_block: 'blok belirleniyor',
  stage_reverse: 'ters DNS okunuyor',
  stage_certificates: 'sertifikalar toplanıyor',
  stage_passive: 'dizinlere soruluyor',
  stage_verify: 'adlar doğrulanıyor',
  stage_summary: 'rapor birleştiriliyor',

  card_address: 'Bu adres',
  card_block: 'Blok',
  card_registry: 'Kayıt defteri',
  card_routing: 'Yönlendirme',
  card_here: 'Bu adresteki siteler',
  card_neighbors: 'Bloktaki komşular',
  card_candidates: 'Adresin ait olduğu bloklar',
  card_unconfirmed: 'İddia edilen ama doğrulanmayan',

  k_names_here: 'Burada doğrulanan site',
  k_shared: 'Paylaşılan adres',
  k_ptr: 'Ters DNS',
  k_cert_subject: 'Sertifika sahibi',
  k_cert_issuer: 'Düzenleyen',
  k_server: 'Server başlığı',
  k_block: 'İncelenen blok',
  k_block_source: 'Seçilme nedeni',
  k_range: 'Aralık',
  k_swept: 'Taranan adres',
  k_with_ptr: 'Ters DNS olan',
  k_responded: '443’te yanıt veren',
  k_net_name: 'Ağ adı',
  k_holder: 'Sahibi',
  k_net_range: 'Tahsis',
  k_country: 'Ülke',
  k_rir: 'Bölgesel kayıt',
  k_registered: 'Kaydedildi',
  k_abuse: 'Kötüye kullanım iletişimi',
  k_asn: 'Otonom sistem',
  k_as_name: 'İşletmeci',
  k_routed_prefix: 'Duyurulan önek',
  k_allocated: 'Tahsis edildi',

  th_name: 'Ad',
  th_sources: 'Bulunduğu yer',
  th_status: 'Doğrulama',
  th_address: 'Adres',
  th_ptr: 'Ters DNS',
  th_names: 'Siteler',
  th_server: 'Sunucu',
  th_block: 'Blok',
  th_source: 'Kaynak',
  th_size: 'Adres',
  th_holder: 'Sahibi',
  th_points_at: 'Şimdi işaret ettiği',

  empty_here: 'Hiçbir ad bu adrese çözülmüyor. Altyapı için normal yanıt budur — bir çözümleyici, bir posta aktarıcısı, bir NAT geçidi — ve vekil sunucu arkasındaki bir site için de.',
  empty_cdn: 'Bu bir CDN düğümü. Üzerinde birbiriyle ilgisiz milyonlarca site yanıt veriyor, dolayısıyla sorunun burada işe yarar bir yanıtı yok.',
  empty_neighbors: 'Blokta hiçbir şey yanıt vermedi ve kimsenin ters DNS kaydı yok.',
  empty_unconfirmed: 'Bulunan her adı şu anda bu adres sunuyor.',
  empty_flags: 'Belirtilecek bir şey yok.',

  /* The shared wording withholds a grade; this service does not have one. */
  incomplete_body: 'Bazı kontroller yanıt alamadı ve boşluğu doldurmak için aşağıda hiçbir şey tahmin edilmedi. Eksik olanlar:',

  note_address: 'Yalnızca şu anda bu adrese çözülen adlar sayılır. Sertifikanın listelediği, düzenlendiği ana ilişkin bir iddiadır.',
  note_block: 'Tarama sınırına sığan en geniş blok taranır. Daha geniş bloklar aşağıda anlatılır ama taranmaz.',
  note_routing: 'Duyurulan önek, Team Cymru üzerinden küresel yönlendirme tablosundan gelir ve genellikle kayıt tahsisinden geniştir.',
  note_here: 'Kaynak, adın ilk görüldüğü yerdir. Doğrulama ise sonradan yapılan bir A veya AAAA sorgusudur.',
  note_neighbors: 'Adres başına bir TCP bağlantısı, 443 numaralı bağlantı noktasına, hiçbir site adı verilmeden — bir sunucunun varsayılan sertifikasını göstermesini sağlayan tam olarak budur.',
  note_candidates: '«Aynı alt ağ» sorusuna üç ayrı yanıt ve hiçbiri yanlış değil. Kayıt defteri adresin kime ait olduğunu, yönlendirme onu hangi ağın taşıdığını söyler; /24 ise barındırmanın satıldığı birimdir.',
  note_unconfirmed: 'Bir kaynağın bu adresle ilişkilendirdiği, DNS’in artık ilişkilendirmediği adlar. Genelde taşınmış bir site; bazen burada hiç barındırılmamış bir alan adı için düzenlenmiş sertifika.',

  v_this_one: 'sorduğunuz adres',
  v_uncountable: 'sayılamayacak kadar çok',

  nst_confirmed: 'burada sunuluyor',
  nst_in_block: 'blokta başka yerde',
  nst_moved: 'taşınmış',
  nst_unresolved: 'artık çözülmüyor',
  nst_wildcard: 'joker, çözülecek bir şey yok',
  nst_unchecked: 'kontrol edilmedi',

  bsrc_registry: 'kayıt tahsisi',
  bsrc_routing: 'duyurulan önek',
  bsrc_conventional: 'alışılmış /24',
  bsrc_requested: 'siz istediniz',

  src_ptr: 'ters DNS',
  src_certificate: 'sertifika',
  src_redirect: 'yönlendirme',
  src_ct: 'Certificate Transparency',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  inc_registry: 'kayıt defteri yanıt vermedi',
  inc_routing: 'yönlendirme sorgusu yanıt vermedi',
  inc_sweep: 'blok taranamadı',
  inc_certificates: 'sertifikalar toplanmadı',
  inc_reverse_ip: 'hiçbir ters IP dizini yanıt vermedi',
  inc_verification: 'adlar zamanında doğrulanamadı',
  inc_verification_truncated: 'aday sayısı doğrulama sınırını aştı',

  err_invalid_prefix: 'Önek uzunluğu 0 ile adres ailesinin genişliği arasında bir sayı olmalıdır.',
  err_block_too_large: 'Bu blok tek bir taramanın gezebileceğinden fazla adres içeriyor. Daha dar bir önek isteyin.',

  flag_cdn_edge: 'Bir ana makine değil, CDN düğümü',
  fd_cdn_edge: 'Adres, tek bir adresin birbiriyle ilgisiz devasa sayıda sitenin önünde durduğu bir içerik dağıtım ağına ait. Burada komşuluk sahiplik hakkında hiçbir şey söylemez, bu yüzden dizinlere sorulmaz.',

  flag_shared_address: 'Bu adresi birkaç site paylaşıyor',
  fd_shared_address: 'Şu anda üçten fazla ad buraya çözülüyor. Bu, paylaşımlı barındırma ya da ters vekil demektir; üzerindeki her şey IP itibarını, hız sınırını ve bir komşunun yediği her engeli paylaşır.',

  flag_no_names_confirmed: 'Hiçbir ad buraya çözülmüyor',
  fd_no_names_confirmed: 'Bulunanların hiçbiri DNS ile doğrulanamadı. Adı hiç anılmayan altyapı, vekil arkasındaki bir adres ve kimsenin dizinlemediği bir adres böyle görünür.',

  flag_stale_claims: 'İddia edilenlerin çoğu taşınmış',
  fd_stale_claims: 'Kaynaklar, kalanlardan çok ayrılan siteleri sayıyor. Eski sertifikalar ve bayat ters IP dizinleri bunu yapar; ikisinden birinden sayı aktarmadan önce bilmekte fayda var.',

  flag_no_reverse_dns: 'Blokta ters DNS yok',
  fd_no_reverse_dns: 'Bloktaki tek bir adres bile PTR sorgusuna yanıt vermiyor. Dakikalıkla dağıtılan bulut aralıklarında olağandır ve kimin neyi işlettiğini anlamanın en ucuz yolunu ortadan kaldırır.',

  flag_single_operator: 'Blok boyunca tek işletmeci',
  fd_single_operator: 'Bloktaki tüm ters adlar aynı alan adıyla bitiyor; yani aralığın tamamını müşterilere bölünmüş değil, tek bir şirket işletiyor.',

  flag_block_wider_than_sweep: 'Gerçek blok tarananın dışına taşıyor',
  fd_block_wider_than_sweep: 'Kayıt defteri ya da yönlendirme tablosu bu adresi tek bir taramanın gezebileceğinden büyük bir aralığa koyuyor; listelenen komşular bütünün değil, bir diliminin komşuları.',

  flag_block_not_enumerable: 'IPv6 bloğu taranamaz',
  fd_block_not_enumerable: 'Bir /64 on sekiz kentilyon adres içerir; IPv6’da adres taraması bu yüzden yoktur. Yalnızca dizinlerin ve sertifika kayıtlarının hâlihazırda bildiği bildirilebilir.',

  flag_block_too_large: 'Blok taranamayacak kadar büyük',
  fd_block_too_large: 'Bu adresi içeren blok, bir kontrolün bağlantı açabileceğinden fazla adres içeriyor; bu yüzden tarama sınırına daraltıldı.',

  flag_probing_disabled: 'Sertifikalar toplanmadı',
  fd_probing_disabled: 'Etkin adım kapalı, dolayısıyla bu rapor yalnızca ters DNS ve genel dizinlerden kuruldu. Bu, daha sessiz ve daha eksik olan yarısı.',

  flag_no_reverse_ip_source: 'Hiçbir ters IP dizini yanıt vermedi',
  fd_no_reverse_ip_source: 'Bu taramanın dışından hiçbir ad gelmedi; burada sertifikasız ve ters DNS kaydı olmadan barınan her şey ona görünmez kalır.',

  flag_providers_available: 'Daha fazla kaynak açılabilir',
  fd_providers_available: 'Bu kurulumda API anahtarı tanımlanmamış ters IP sağlayıcıları var. Bir anahtar yapılandırıldığında paylaşımlı barındırma kapsamı belirgin biçimde artar.',
};

OWN.uk = {
  title: 'Сусіди за IP — хто ще живе на цій адресі та в її підмережі',
  title_short: 'Сусіди за IP',
  h1: 'Сусіди за IP',
  subtitle: 'Усе інше, що живе на адресі та в блоці навколо неї: зворотний DNS, імена в сертифікатах, реєстр і таблиця маршрутизації — і кожне ім’я перевірене прямим запитом, перш ніж назване сусідом',
  ph_host: '8.8.8.8',
  hero_label: 'Досліджувана адреса',
  hero_count: 'сайтів тут',
  badge_cdn: 'вузол CDN',
  empty_hint: 'Введіть IP-адресу, блок у вигляді 8.8.8.0-24 або доменне ім’я. Перевірка спершу з’ясовує, до якого блоку належить адреса — виділення з реєстру, анонсований префікс і /24 збігаються рідко, — далі читає зворотний DNS для кожної адреси блоку та сертифікат, який кожна з них показує, коли сайт не названо. Кожне знайдене ім’я перевіряється прямим запитом: у сертифікаті перелічені імена, на які його видано, а не ті, що тут досі живуть.',

  stage_resolve: 'визначаємо адресу',
  stage_block: 'з’ясовуємо блок',
  stage_reverse: 'читаємо зворотний DNS',
  stage_certificates: 'збираємо сертифікати',
  stage_passive: 'питаємо індекси',
  stage_verify: 'підтверджуємо імена',
  stage_summary: 'складаємо звіт',

  card_address: 'Ця адреса',
  card_block: 'Блок',
  card_registry: 'Реєстр',
  card_routing: 'Маршрутизація',
  card_here: 'Сайти на цій адресі',
  card_neighbors: 'Сусіди по блоку',
  card_candidates: 'Блоки, до яких належить адреса',
  card_unconfirmed: 'Заявлено, але не підтверджено',

  k_names_here: 'Підтверджених сайтів',
  k_shared: 'Спільна адреса',
  k_ptr: 'Зворотний DNS',
  k_cert_subject: 'Суб’єкт сертифіката',
  k_cert_issuer: 'Ким видано',
  k_server: 'Заголовок Server',
  k_block: 'Перевірений блок',
  k_block_source: 'Обрано тому що',
  k_range: 'Діапазон',
  k_swept: 'Пройдено адрес',
  k_with_ptr: 'Зі зворотним DNS',
  k_responded: 'Відповіли на 443',
  k_net_name: 'Ім’я мережі',
  k_holder: 'Власник',
  k_net_range: 'Виділення',
  k_country: 'Країна',
  k_rir: 'Реєстратура',
  k_registered: 'Зареєстровано',
  k_abuse: 'Контакт для скарг',
  k_asn: 'Автономна система',
  k_as_name: 'Оператор',
  k_routed_prefix: 'Анонсований префікс',
  k_allocated: 'Виділено',

  th_name: 'Ім’я',
  th_sources: 'Знайдено в',
  th_status: 'Підтвердження',
  th_address: 'Адреса',
  th_ptr: 'Зворотний DNS',
  th_names: 'Сайти',
  th_server: 'Сервер',
  th_block: 'Блок',
  th_source: 'Джерело',
  th_size: 'Адрес',
  th_holder: 'Власник',
  th_points_at: 'Зараз вказує на',

  empty_here: 'Жодне ім’я не розв’язується в цю адресу. Звичайна відповідь для інфраструктури — резолвера, поштового релея, NAT-шлюзу — і для сайта за проксі.',
  empty_cdn: 'Це вузол CDN. На ньому відповідають мільйони ніяк не пов’язаних сайтів, тож корисної відповіді питання тут не має.',
  empty_neighbors: 'Ніхто в блоці не відповів, і зворотного DNS ні в кого немає.',
  empty_unconfirmed: 'Усі знайдені імена ця адреса обслуговує й зараз.',
  empty_flags: 'Відзначати нічого.',

  /* The shared wording withholds a grade; this service does not have one. */
  incomplete_body: 'Частина перевірок не отримала відповіді, і нічого нижче не вигадано, щоб закрити прогалину. Чого бракує:',

  note_address: 'Рахуються лише імена, що розв’язуються в цю адресу просто зараз. Перелічене в сертифікаті — твердження про момент видачі.',
  note_block: 'Проходиться найширший блок, що вміщується в ліміт обходу. Ширші блоки описані нижче, але не проходяться.',
  note_routing: 'Анонсований префікс узято з глобальної таблиці маршрутизації через Team Cymru і зазвичай він ширший за виділення з реєстру.',
  note_here: 'Джерело — де ім’я трапилося вперше. Підтвердження — свіжий запит A або AAAA, зроблений уже після.',
  note_neighbors: 'Одне TCP-з’єднання на адресу, порт 443, без зазначення сайта — саме тому сервер показує сертифікат за умовчанням.',
  note_candidates: 'Три різні відповіді на «та сама підмережа», і жодна не хибна. Реєстр каже, чия це адреса, маршрутизація — чия мережа її несе, а /24 — це одиниця, якою торгує хостинг.',
  note_unconfirmed: 'Імена, які якесь джерело пов’язує з цією адресою, а DNS уже ні. Зазвичай сайт переїхав; іноді сертифікат видано на домен, що тут ніколи не жив.',

  v_this_one: 'про неї й питали',
  v_uncountable: 'не порахувати',

  nst_confirmed: 'обслуговується тут',
  nst_in_block: 'в іншому місці блоку',
  nst_moved: 'переїхав',
  nst_unresolved: 'більше не розв’язується',
  nst_wildcard: 'wildcard, розв’язувати нічого',
  nst_unchecked: 'не перевірялося',

  bsrc_registry: 'виділення з реєстру',
  bsrc_routing: 'анонсований префікс',
  bsrc_conventional: 'загальноприйнятий /24',
  bsrc_requested: 'ви його й запросили',

  src_ptr: 'зворотний DNS',
  src_certificate: 'сертифікат',
  src_redirect: 'перенаправлення',
  src_ct: 'Certificate Transparency',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  inc_registry: 'реєстр не відповів',
  inc_routing: 'запит маршрутизації не відповів',
  inc_sweep: 'блок пройти не вдалося',
  inc_certificates: 'сертифікати не збиралися',
  inc_reverse_ip: 'жоден reverse-IP індекс не відповів',
  inc_verification: 'імена не встигли підтвердитися',
  inc_verification_truncated: 'кандидатів більше, ніж ліміт перевірки',

  err_invalid_prefix: 'Довжина префікса має бути числом від 0 до розміру адресного простору.',
  err_block_too_large: 'У цьому блоці більше адрес, ніж можна пройти за одну перевірку. Запитайте вужчий префікс.',

  flag_cdn_edge: 'Це вузол CDN, а не хост',
  fd_cdn_edge: 'Адреса належить мережі доставки контенту, де за однією адресою стоїть величезна кількість ніяк не пов’язаних сайтів. Сусідство тут нічого не каже про належність, тому індекси не опитувалися.',

  flag_shared_address: 'Адресу ділять кілька сайтів',
  fd_shared_address: 'Просто зараз сюди розв’язується більше трьох імен. Це шаред-хостинг або зворотний проксі, і все, що на ньому стоїть, ділить репутацію адреси, спільний рейт-ліміт і будь-яке блокування, яке заробить хтось із сусідів.',

  flag_no_names_confirmed: 'Жодне ім’я сюди не розв’язується',
  fd_no_names_confirmed: 'Нічого зі знайденого не вдалося підтвердити через DNS. Так виглядає інфраструктура, яку ніхто не називає на ім’я, адреса за проксі та адреса, якої немає в індексах.',

  flag_stale_claims: 'Більшість заявленого переїхала',
  fd_stale_claims: 'Джерела називають більше сайтів, що пішли, ніж тих, що лишилися. Так поводяться і старі сертифікати, і несвіжі reverse-IP індекси — варто знати про це, перш ніж цитувати число з будь-якого з них.',

  flag_no_reverse_dns: 'У всьому блоці немає зворотного DNS',
  fd_no_reverse_dns: 'Жодна адреса блоку не відповідає на PTR-запит. Звична річ для хмарних діапазонів, що видаються похвилинно, і це позбавляє найдешевшого способу зрозуміти, хто чим володіє.',

  flag_single_operator: 'Увесь блок під одним оператором',
  fd_single_operator: 'Усі зворотні імена в блоці закінчуються одним доменом — отже, діапазон цілком веде одна компанія, а не поділений між клієнтами.',

  flag_block_wider_than_sweep: 'Справжній блок ширший за пройдений',
  fd_block_wider_than_sweep: 'Реєстр або таблиця маршрутизації розміщують адресу в діапазоні більшому, ніж можна пройти за одну перевірку, тож перелічені сусіди — його частина, а не весь список.',

  flag_block_not_enumerable: 'Блок IPv6 пройти не можна',
  fd_block_not_enumerable: 'У /64 вісімнадцять квінтильйонів адрес — тому сканування адрес в IPv6 не існує. Показати можна лише те, що вже знають індекси та журнали сертифікатів.',

  flag_block_too_large: 'Блок завеликий для обходу',
  fd_block_too_large: 'У блоці з цією адресою більше адрес, ніж дозволяє одна перевірка, тому його звужено до ліміту обходу.',

  flag_probing_disabled: 'Сертифікати не збиралися',
  fd_probing_disabled: 'Активний крок вимкнено, і звіт складено лише зі зворотного DNS та публічних індексів. Це тихіша половина — і менш повна.',

  flag_no_reverse_ip_source: 'Жоден reverse-IP індекс не відповів',
  fd_no_reverse_ip_source: 'Імена не надійшли нізвідки, крім самої перевірки, — отже, все, що живе тут без сертифіката й без зворотного DNS, для неї невидиме.',

  flag_providers_available: 'Можна підключити більше джерел',
  fd_providers_available: 'У цієї встановки є reverse-IP провайдери, для яких не задано ключ API. З налаштованим ключем покриття шаред-хостингу помітно зросте.',
};

OWN.zh = {
  title: 'IP 邻居 — 这个地址和它所在网段里还住着谁',
  title_short: 'IP 邻居',
  h1: 'IP 邻居',
  subtitle: '一个地址以及它周围网段里的其他一切：反向 DNS、每张证书上的名字、注册数据与路由表 —— 并且每个名字都会被正向解析核实之后，才称之为邻居',
  ph_host: '8.8.8.8',
  hero_label: '被检查的地址',
  hero_count: '个站点在此',
  badge_cdn: 'CDN 节点',
  empty_hint: '输入一个 IP 地址、形如 8.8.8.0-24 的网段，或一个域名。检查会先判断该地址属于哪个块 —— 注册机构的分配、路由公告的前缀和 /24 三者很少一致 —— 然后读取块内每个地址的反向 DNS，以及在不指明站点时每个地址出示的证书。找到的每个名字都会被重新解析：证书列出的是签发时的名字，而不是如今仍托管在此的名字。',

  stage_resolve: '解析地址',
  stage_block: '判定网段',
  stage_reverse: '读取反向 DNS',
  stage_certificates: '收集证书',
  stage_passive: '查询索引',
  stage_verify: '核实每个名字',
  stage_summary: '汇总报告',

  card_address: '这个地址',
  card_block: '网段',
  card_registry: '注册数据',
  card_routing: '路由',
  card_here: '此地址上的站点',
  card_neighbors: '网段中的邻居',
  card_candidates: '该地址所属的网段',
  card_unconfirmed: '有人声称但未获证实',

  k_names_here: '此处确认的站点',
  k_shared: '共享地址',
  k_ptr: '反向 DNS',
  k_cert_subject: '证书主体',
  k_cert_issuer: '签发者',
  k_server: 'Server 头',
  k_block: '检查的网段',
  k_block_source: '选择原因',
  k_range: '范围',
  k_swept: '遍历的地址数',
  k_with_ptr: '有反向 DNS',
  k_responded: '443 端口应答',
  k_net_name: '网络名称',
  k_holder: '持有者',
  k_net_range: '分配',
  k_country: '国家',
  k_rir: '注册机构',
  k_registered: '注册时间',
  k_abuse: '滥用举报联系人',
  k_asn: '自治系统',
  k_as_name: '运营方',
  k_routed_prefix: '路由前缀',
  k_allocated: '分配时间',

  th_name: '名称',
  th_sources: '来源',
  th_status: '核实结果',
  th_address: '地址',
  th_ptr: '反向 DNS',
  th_names: '站点',
  th_server: '服务器',
  th_block: '网段',
  th_source: '来源',
  th_size: '地址数',
  th_holder: '持有者',
  th_points_at: '现在指向',

  empty_here: '没有任何名字解析到这个地址。对于基础设施 —— 解析器、邮件中继、NAT 网关 —— 以及藏在代理后面的站点，这就是正常答案。',
  empty_cdn: '这是一个 CDN 节点。数以百万计毫不相干的站点都在它上面应答，所以这个问题在这里没有有用的答案。',
  empty_neighbors: '网段里没有任何地址应答，也没有任何地址设置了反向 DNS。',
  empty_unconfirmed: '找到的每个名字，现在都由这个地址提供服务。',
  empty_flags: '没有需要指出的地方。',

  /* The shared wording withholds a grade; this service does not have one. */
  incomplete_body: '部分检查没有得到回答，下面也没有任何内容是猜出来填补空缺的。缺少的是：',

  note_address: '只统计此刻解析到该地址的名字。证书列出的内容，是关于签发那一刻的断言。',
  note_block: '遍历的是能装进扫描上限的最宽网段。更宽的网段会在下方描述，但不会遍历。',
  note_routing: '路由前缀经 Team Cymru 取自全球路由表，通常比注册机构的分配更宽。',
  note_here: '来源是这个名字最先出现的地方；核实则是随后做的一次 A 或 AAAA 查询。',
  note_neighbors: '每个地址一条 TCP 连接，连到 443 端口，且不指明任何站点 —— 正是这一点让服务器出示它的默认证书。',
  note_candidates: '对「同一个子网」的三种不同回答，没有一种是错的。注册数据说地址归谁，路由说是谁的网络在承载它，而 /24 是主机托管出售的单位。',
  note_unconfirmed: '某个来源把它们与这个地址联系在一起，而 DNS 已经不再。通常是搬走的站点；有时是为从未托管在此的域名签发的证书。',

  v_this_one: '你查询的地址',
  v_uncountable: '多到数不清',

  nst_confirmed: '在此提供服务',
  nst_in_block: '在网段的别处',
  nst_moved: '已搬走',
  nst_unresolved: '已无法解析',
  nst_wildcard: '通配符，无从解析',
  nst_unchecked: '未核实',

  bsrc_registry: '注册机构的分配',
  bsrc_routing: '路由公告的前缀',
  bsrc_conventional: '惯用的 /24',
  bsrc_requested: '你指定的',

  src_ptr: '反向 DNS',
  src_certificate: '证书',
  src_redirect: '重定向',
  src_ct: '证书透明度',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  inc_registry: '注册机构未应答',
  inc_routing: '路由查询未应答',
  inc_sweep: '无法遍历该网段',
  inc_certificates: '未收集证书',
  inc_reverse_ip: '没有反查索引应答',
  inc_verification: '来不及确认这些名字',
  inc_verification_truncated: '候选数量超过核实上限',

  err_invalid_prefix: '前缀长度必须是 0 到该地址族位宽之间的数字。',
  err_block_too_large: '该网段的地址数超过一次检查所能遍历的上限。请指定更窄的前缀。',

  flag_cdn_edge: '这是 CDN 节点，不是主机',
  fd_cdn_edge: '该地址属于内容分发网络，一个地址背后是数量庞大且互不相干的站点。此处的邻居关系与归属无关，因此没有去查询索引。',

  flag_shared_address: '多个站点共用此地址',
  fd_shared_address: '此刻有三个以上的名字解析到这里。这是共享主机或反向代理，上面的一切共享同一个 IP 信誉、同一套限流，以及任何一位邻居招来的封禁。',

  flag_no_names_confirmed: '没有名字解析到这里',
  fd_no_names_confirmed: '找到的内容都无法用 DNS 证实。无人称呼的基础设施、代理背后的地址，以及无人收录的地址，看上去都是这样。',

  flag_stale_claims: '被声称的大多已经搬走',
  fd_stale_claims: '各来源列出的离开的站点比留下的还多。陈旧的证书和过期的反查索引都会这样，在引用其中任何一个数字之前值得知道这一点。',

  flag_no_reverse_dns: '整个网段都没有反向 DNS',
  fd_no_reverse_dns: '网段里没有一个地址回应 PTR 查询。按分钟发放的云地址段常常如此，而这也断掉了判断谁在运行什么的最省事的办法。',

  flag_single_operator: '整个网段由一家运营',
  fd_single_operator: '网段里所有反向名字都以同一个域名结尾，说明整段由一家公司运营，而不是分给了不同客户。',

  flag_block_wider_than_sweep: '真实网段比遍历范围更宽',
  fd_block_wider_than_sweep: '注册机构或路由表把这个地址放在一个大于单次检查可遍历范围的段里，所以列出的邻居只是其中一部分，而非全部。',

  flag_block_not_enumerable: 'IPv6 网段无法遍历',
  fd_block_not_enumerable: '一个 /64 有一千八百亿亿个地址，这正是 IPv6 上不存在地址扫描的原因。只能报告索引和证书日志已经知道的内容。',

  flag_block_too_large: '网段过大，无法遍历',
  fd_block_too_large: '包含该地址的网段，其地址数超过一次检查所能建立连接的数量，因此已收窄到扫描上限。',

  flag_probing_disabled: '未收集证书',
  fd_probing_disabled: '主动步骤已关闭，本报告仅由反向 DNS 和公开索引构成。这是更安静的一半，也是更不完整的一半。',

  flag_no_reverse_ip_source: '没有反查索引应答',
  fd_no_reverse_ip_source: '本次检查之外没有任何来源提供名字，因此这里既无证书也无反向 DNS 的站点，对它是不可见的。',

  flag_providers_available: '还可以启用更多来源',
  fd_providers_available: '本部署有可用的反查数据提供方，但没有配置 API 密钥。配置之后，共享主机的覆盖率会明显提高。',
};

OWN.ja = {
  title: 'IP のご近所 — このアドレスとそのブロックに他に何が住んでいるか',
  title_short: 'IP のご近所',
  h1: 'IP のご近所',
  subtitle: 'あるアドレスと、その周囲のブロックに住んでいるものすべて。逆引き DNS、各証明書に載る名前、レジストリと経路表 — そして隣人と呼ぶ前に、どの名前も正引きで確かめ直す',
  ph_host: '8.8.8.8',
  hero_label: '調べているアドレス',
  hero_count: '件のサイト',
  badge_cdn: 'CDN エッジ',
  empty_hint: 'IP アドレス、8.8.8.0-24 の形式のブロック、あるいはドメイン名を入力してください。まずアドレスがどのブロックに属するかを調べます — レジストリの割り当て、経路広告のプレフィックス、/24 の三つが一致することはめったにありません。次にブロック内の各アドレスの逆引き DNS と、サイト名を告げないときに各アドレスが示す証明書を読みます。見つかった名前はどれも正引きで確認されます。証明書に並ぶのは発行時の名前であって、今もそこでホストされている名前ではありません。',

  stage_resolve: 'アドレスを解決',
  stage_block: 'ブロックを判定',
  stage_reverse: '逆引き DNS を読む',
  stage_certificates: '証明書を集める',
  stage_passive: 'インデックスに問い合わせ',
  stage_verify: '名前を確認',
  stage_summary: 'レポートを組み立て',

  card_address: 'このアドレス',
  card_block: 'ブロック',
  card_registry: 'レジストリ',
  card_routing: '経路',
  card_here: 'このアドレスのサイト',
  card_neighbors: 'ブロック内の隣人',
  card_candidates: 'このアドレスが属するブロック',
  card_unconfirmed: '主張されたが未確認',

  k_names_here: 'ここで確認できたサイト',
  k_shared: '共有アドレス',
  k_ptr: '逆引き DNS',
  k_cert_subject: '証明書のサブジェクト',
  k_cert_issuer: '発行者',
  k_server: 'Server ヘッダ',
  k_block: '調べたブロック',
  k_block_source: '選んだ理由',
  k_range: '範囲',
  k_swept: '巡回したアドレス数',
  k_with_ptr: '逆引きあり',
  k_responded: '443 で応答',
  k_net_name: 'ネットワーク名',
  k_holder: '保有者',
  k_net_range: '割り当て',
  k_country: '国',
  k_rir: 'レジストリ',
  k_registered: '登録日',
  k_abuse: '不正利用の連絡先',
  k_asn: '自律システム',
  k_as_name: '運用者',
  k_routed_prefix: '経路プレフィックス',
  k_allocated: '割り当て日',

  th_name: '名前',
  th_sources: '見つかった場所',
  th_status: '確認結果',
  th_address: 'アドレス',
  th_ptr: '逆引き DNS',
  th_names: 'サイト',
  th_server: 'サーバ',
  th_block: 'ブロック',
  th_source: '出所',
  th_size: 'アドレス数',
  th_holder: '保有者',
  th_points_at: '現在の向き先',

  empty_here: 'このアドレスに解決する名前はありません。リゾルバ、メールリレー、NAT ゲートウェイといった基盤設備、そしてプロキシの背後にあるサイトでは、これが普通の答えです。',
  empty_cdn: 'これは CDN のエッジです。無関係なサイトが何百万も応答するため、この問いにここで有用な答えはありません。',
  empty_neighbors: 'ブロック内のどれも応答せず、逆引き DNS を持つものもありません。',
  empty_unconfirmed: '見つかった名前はすべて、現にこのアドレスが提供しています。',
  empty_flags: '取り立てて言うことはありません。',

  /* The shared wording withholds a grade; this service does not have one. */
  incomplete_body: '一部の確認は答えを得られず、その穴を埋めるための推測は下に一つもありません。欠けているもの：',

  note_address: '数えるのは、いまこのアドレスに解決する名前だけです。証明書が並べているのは、発行時点についての主張です。',
  note_block: '巡回するのは、掃引上限に収まる最も広いブロックです。それより広いブロックは下で説明しますが、巡回はしません。',
  note_routing: '経路プレフィックスは Team Cymru 経由で世界の経路表から取得したもので、通常はレジストリの割り当てより広くなります。',
  note_here: '出所はその名前が最初に現れた場所、確認はそのあとに行った A / AAAA 問い合わせです。',
  note_neighbors: 'アドレスごとに TCP 接続を一本、443 番へ、サイト名を告げずに — これがサーバに既定の証明書を出させます。',
  note_candidates: '「同じサブネット」への三通りの答えで、どれも間違いではありません。レジストリはアドレスの持ち主を、経路はそれを運ぶネットワークを示し、/24 はホスティングが売られる単位です。',
  note_unconfirmed: '何らかの出所がこのアドレスと結びつけ、DNS はもう結びつけていない名前です。たいていは引っ越したサイト、ときにここで一度もホストされたことのないドメインの証明書です。',

  v_this_one: '問い合わせたアドレス',
  v_uncountable: '数えきれない',

  nst_confirmed: 'ここで提供中',
  nst_in_block: 'ブロック内の別の場所',
  nst_moved: '移転済み',
  nst_unresolved: 'もう解決しない',
  nst_wildcard: 'ワイルドカード、解決対象なし',
  nst_unchecked: '未確認',

  bsrc_registry: 'レジストリの割り当て',
  bsrc_routing: '経路広告のプレフィックス',
  bsrc_conventional: '慣例の /24',
  bsrc_requested: '指定されたもの',

  src_ptr: '逆引き DNS',
  src_certificate: '証明書',
  src_redirect: 'リダイレクト',
  src_ct: '証明書の透明性',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  inc_registry: 'レジストリが応答しなかった',
  inc_routing: '経路の問い合わせが応答しなかった',
  inc_sweep: 'ブロックを巡回できなかった',
  inc_certificates: '証明書を集めなかった',
  inc_reverse_ip: '逆引き IP インデックスの応答なし',
  inc_verification: '名前の確認が間に合わなかった',
  inc_verification_truncated: '候補が確認上限を超えた',

  err_invalid_prefix: 'プレフィックス長は 0 からアドレスファミリの幅までの数値である必要があります。',
  err_block_too_large: 'このブロックは一度の検査で巡回できる数を超えるアドレスを含みます。より狭いプレフィックスを指定してください。',

  flag_cdn_edge: 'ホストではなく CDN エッジ',
  fd_cdn_edge: 'このアドレスはコンテンツ配信ネットワークのもので、一つのアドレスが無関係な膨大な数のサイトの窓口になっています。ここでの近さは所有者について何も語らないため、インデックスへの問い合わせは行いません。',

  flag_shared_address: '複数のサイトがこのアドレスを共有',
  fd_shared_address: 'いま三つを超える名前がここに解決しています。共有ホスティングかリバースプロキシで、その上にあるものはすべて IP の評判、レート制限、そして隣人が招いたどんな遮断も分かち合います。',

  flag_no_names_confirmed: 'ここに解決する名前がない',
  fd_no_names_confirmed: '見つかったもののどれも DNS で裏付けられませんでした。誰も名前で呼ばない基盤設備、プロキシの背後のアドレス、どのインデックスにも載らないアドレスは、どれもこう見えます。',

  flag_stale_claims: '主張の大半は移転済み',
  fd_stale_claims: '各出所は、残っているサイトより去ったサイトを多く挙げています。古い証明書も、更新の止まった逆引きインデックスもこうなります。どちらの数字を引くにせよ、知っておく価値があります。',

  flag_no_reverse_dns: 'ブロック内に逆引き DNS がない',
  fd_no_reverse_dns: 'ブロック内のどのアドレスも PTR 問い合わせに答えません。分単位で貸し出されるクラウドの範囲ではよくあることで、誰が何を運用しているかを知る最も安価な手段が失われます。',

  flag_single_operator: 'ブロック全体が一社の運用',
  fd_single_operator: 'ブロック内の逆引き名がすべて同じドメインで終わっています。範囲全体を一社が運用しており、顧客に分割されてはいません。',

  flag_block_wider_than_sweep: '実際のブロックは巡回範囲より広い',
  fd_block_wider_than_sweep: 'レジストリまたは経路表は、このアドレスを一度の検査で巡回できる範囲より大きな区画に置いています。挙げた隣人はその一部であり、全部ではありません。',

  flag_block_not_enumerable: 'IPv6 ブロックは巡回できない',
  fd_block_not_enumerable: '/64 には千八百京個のアドレスがあり、だからこそ IPv6 にアドレススキャンは存在しません。報告できるのは、インデックスと証明書ログが既に知っていることだけです。',

  flag_block_too_large: 'ブロックが大きすぎて巡回できない',
  fd_block_too_large: 'このアドレスを含むブロックは、一度の検査で接続できる数を超えるアドレスを持つため、掃引上限まで狭めました。',

  flag_probing_disabled: '証明書を集めていない',
  fd_probing_disabled: '能動的な手順が無効なので、このレポートは逆引き DNS と公開インデックスだけで組み立てられています。静かな半分であり、不完全な半分でもあります。',

  flag_no_reverse_ip_source: '逆引き IP インデックスの応答なし',
  fd_no_reverse_ip_source: 'この検査の外から名前は一つも得られませんでした。証明書も逆引きもなくここでホストされているものは、この検査からは見えません。',

  flag_providers_available: 'さらに出所を有効化できる',
  fd_providers_available: 'この環境には API キーが設定されていない逆引き IP プロバイダがあります。キーを設定すると、共有ホスティングの網羅率がかなり上がります。',
};

OWN.hi = {
  title: 'IP पड़ोसी — इस पते पर और इसके ब्लॉक में और कौन रहता है',
  title_short: 'IP पड़ोसी',
  h1: 'IP पड़ोसी',
  subtitle: 'एक पते पर और उसके आसपास के ब्लॉक में रहने वाला बाकी सब कुछ: रिवर्स DNS, हर प्रमाणपत्र पर दर्ज नाम, रजिस्ट्री और रूटिंग तालिका — और पड़ोसी कहने से पहले हर नाम को आगे की दिशा में फिर से हल किया जाता है',
  ph_host: '8.8.8.8',
  hero_label: 'जाँचा जा रहा पता',
  hero_count: 'साइटें यहाँ',
  badge_cdn: 'CDN एज',
  empty_hint: 'कोई IP पता, 8.8.8.0-24 जैसा ब्लॉक, या डोमेन नाम दर्ज करें। जाँच पहले तय करती है कि पता किस ब्लॉक का है — रजिस्ट्री का आवंटन, घोषित प्रीफ़िक्स और /24 शायद ही कभी मेल खाते हैं — फिर ब्लॉक के हर पते का रिवर्स DNS पढ़ती है और वह प्रमाणपत्र भी, जो कोई साइट न बताए जाने पर हर पता दिखाता है। मिला हुआ हर नाम फिर से हल किया जाता है: प्रमाणपत्र उन नामों की सूची देता है जिनके लिए वह जारी हुआ, न कि उनकी जो अब भी यहाँ होस्ट हैं।',

  stage_resolve: 'पता हल किया जा रहा है',
  stage_block: 'ब्लॉक तय किया जा रहा है',
  stage_reverse: 'रिवर्स DNS पढ़ा जा रहा है',
  stage_certificates: 'प्रमाणपत्र इकट्ठे किए जा रहे हैं',
  stage_passive: 'इंडेक्स से पूछा जा रहा है',
  stage_verify: 'हर नाम की पुष्टि',
  stage_summary: 'रिपोर्ट बनाई जा रही है',

  card_address: 'यह पता',
  card_block: 'ब्लॉक',
  card_registry: 'रजिस्ट्री',
  card_routing: 'रूटिंग',
  card_here: 'इस पते पर मौजूद साइटें',
  card_neighbors: 'ब्लॉक के पड़ोसी',
  card_candidates: 'वे ब्लॉक जिनमें यह पता है',
  card_unconfirmed: 'दावा किया गया, पुष्टि नहीं',

  k_names_here: 'यहाँ पुष्ट साइटें',
  k_shared: 'साझा पता',
  k_ptr: 'रिवर्स DNS',
  k_cert_subject: 'प्रमाणपत्र का विषय',
  k_cert_issuer: 'जारीकर्ता',
  k_server: 'Server हेडर',
  k_block: 'जाँचा गया ब्लॉक',
  k_block_source: 'चुनने का कारण',
  k_range: 'सीमा',
  k_swept: 'देखे गए पते',
  k_with_ptr: 'रिवर्स DNS वाले',
  k_responded: '443 पर उत्तर',
  k_net_name: 'नेटवर्क का नाम',
  k_holder: 'धारक',
  k_net_range: 'आवंटन',
  k_country: 'देश',
  k_rir: 'रजिस्ट्री',
  k_registered: 'पंजीकृत',
  k_abuse: 'दुरुपयोग संपर्क',
  k_asn: 'स्वायत्त सिस्टम',
  k_as_name: 'संचालक',
  k_routed_prefix: 'घोषित प्रीफ़िक्स',
  k_allocated: 'आवंटित',

  th_name: 'नाम',
  th_sources: 'कहाँ मिला',
  th_status: 'पुष्टि',
  th_address: 'पता',
  th_ptr: 'रिवर्स DNS',
  th_names: 'साइटें',
  th_server: 'सर्वर',
  th_block: 'ब्लॉक',
  th_source: 'स्रोत',
  th_size: 'पते',
  th_holder: 'धारक',
  th_points_at: 'अब इशारा करता है',

  empty_here: 'कोई भी नाम इस पते पर हल नहीं होता। ढाँचे के लिए यही सामान्य उत्तर है — रिज़ॉल्वर, मेल रिले, NAT गेटवे — और प्रॉक्सी के पीछे बैठी साइट के लिए भी।',
  empty_cdn: 'यह एक CDN एज है। इस पर लाखों असंबंधित साइटें उत्तर देती हैं, इसलिए यहाँ इस सवाल का कोई उपयोगी उत्तर नहीं है।',
  empty_neighbors: 'ब्लॉक में किसी ने उत्तर नहीं दिया और किसी के पास रिवर्स DNS नहीं है।',
  empty_unconfirmed: 'मिला हुआ हर नाम इस समय यही पता परोस रहा है।',
  empty_flags: 'बताने लायक कुछ नहीं।',

  /* The shared wording withholds a grade; this service does not have one. */
  incomplete_body: 'कुछ जाँचों को उत्तर नहीं मिला, और खाली जगह भरने के लिए नीचे कुछ भी अनुमान से नहीं लिखा गया। जो नहीं मिला:',

  note_address: 'केवल वही नाम गिने जाते हैं जो इस समय इस पते पर हल होते हैं। प्रमाणपत्र जो सूचीबद्ध करता है, वह उसके जारी होने के समय का दावा है।',
  note_block: 'वही ब्लॉक देखा जाता है जो स्वीप सीमा में सबसे चौड़ा बैठता है। इससे बड़े ब्लॉक नीचे बताए गए हैं, पर देखे नहीं गए।',
  note_routing: 'घोषित प्रीफ़िक्स Team Cymru के ज़रिए वैश्विक रूटिंग तालिका से आता है और आम तौर पर रजिस्ट्री के आवंटन से चौड़ा होता है।',
  note_here: 'स्रोत वह जगह है जहाँ नाम पहली बार दिखा; पुष्टि उसके बाद की गई A या AAAA क्वेरी है।',
  note_neighbors: 'हर पते के लिए एक TCP कनेक्शन, पोर्ट 443 पर, बिना कोई साइट बताए — इसी से सर्वर अपना डिफ़ॉल्ट प्रमाणपत्र दिखाता है।',
  note_candidates: '«एक ही सबनेट» के तीन अलग उत्तर, और कोई भी गलत नहीं। रजिस्ट्री बताती है पता किसका है, रूटिंग बताती है उसे कौन-सा नेटवर्क ढोता है, और /24 वह इकाई है जिसमें होस्टिंग बिकती है।',
  note_unconfirmed: 'वे नाम जिन्हें कोई स्रोत इस पते से जोड़ता है और DNS अब नहीं जोड़ता। आम तौर पर कोई साइट चली गई; कभी-कभी ऐसे डोमेन का प्रमाणपत्र जो यहाँ कभी होस्ट ही नहीं था।',

  v_this_one: 'जिसके बारे में पूछा',
  v_uncountable: 'अनगिनत',

  nst_confirmed: 'यहीं से परोसा जाता है',
  nst_in_block: 'ब्लॉक में कहीं और',
  nst_moved: 'चला गया',
  nst_unresolved: 'अब हल नहीं होता',
  nst_wildcard: 'वाइल्डकार्ड, हल करने को कुछ नहीं',
  nst_unchecked: 'जाँचा नहीं गया',

  bsrc_registry: 'रजिस्ट्री का आवंटन',
  bsrc_routing: 'घोषित प्रीफ़िक्स',
  bsrc_conventional: 'पारंपरिक /24',
  bsrc_requested: 'आपने ही माँगा',

  src_ptr: 'रिवर्स DNS',
  src_certificate: 'प्रमाणपत्र',
  src_redirect: 'रीडायरेक्ट',
  src_ct: 'Certificate Transparency',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  inc_registry: 'रजिस्ट्री ने उत्तर नहीं दिया',
  inc_routing: 'रूटिंग क्वेरी का उत्तर नहीं आया',
  inc_sweep: 'ब्लॉक देखा नहीं जा सका',
  inc_certificates: 'प्रमाणपत्र इकट्ठे नहीं किए गए',
  inc_reverse_ip: 'किसी रिवर्स-IP इंडेक्स ने उत्तर नहीं दिया',
  inc_verification: 'नाम समय पर पुष्ट नहीं हो सके',
  inc_verification_truncated: 'पुष्टि सीमा से अधिक उम्मीदवार',

  err_invalid_prefix: 'प्रीफ़िक्स की लंबाई 0 और पता परिवार की चौड़ाई के बीच की संख्या होनी चाहिए।',
  err_block_too_large: 'इस ब्लॉक में एक जाँच में देखे जा सकने से अधिक पते हैं। कोई सँकरा प्रीफ़िक्स माँगें।',

  flag_cdn_edge: 'यह होस्ट नहीं, CDN एज है',
  fd_cdn_edge: 'पता एक कंटेंट डिलीवरी नेटवर्क का है, जहाँ एक ही पता बहुत बड़ी संख्या में असंबंधित साइटों का मुख बनता है। यहाँ पड़ोस स्वामित्व के बारे में कुछ नहीं कहता, इसलिए इंडेक्स से पूछा ही नहीं गया।',

  flag_shared_address: 'कई साइटें यह पता साझा करती हैं',
  fd_shared_address: 'इस समय तीन से अधिक नाम यहाँ हल होते हैं। यह साझा होस्टिंग या रिवर्स प्रॉक्सी है, और उस पर बैठी हर चीज़ IP की प्रतिष्ठा, दर-सीमा और किसी पड़ोसी की कमाई हुई हर रुकावट साझा करती है।',

  flag_no_names_confirmed: 'कोई नाम यहाँ हल नहीं होता',
  fd_no_names_confirmed: 'जो मिला उसमें से कुछ भी DNS से पुष्ट नहीं हुआ। जिस ढाँचे को कोई नाम से नहीं पुकारता, प्रॉक्सी के पीछे का पता, और जिसे कोई इंडेक्स नहीं करता — सब ऐसे ही दिखते हैं।',

  flag_stale_claims: 'दावा किए गए अधिकांश जा चुके',
  fd_stale_claims: 'स्रोत रुके हुए से ज़्यादा जा चुकी साइटों के नाम देते हैं। पुराने प्रमाणपत्र और बासी रिवर्स-IP इंडेक्स दोनों ऐसा करते हैं, और इनमें से किसी का आँकड़ा दोहराने से पहले यह जानना उपयोगी है।',

  flag_no_reverse_dns: 'ब्लॉक में कहीं रिवर्स DNS नहीं',
  fd_no_reverse_dns: 'ब्लॉक का एक भी पता PTR क्वेरी का उत्तर नहीं देता। मिनटों के हिसाब से बँटने वाली क्लाउड रेंज में यह आम है, और इससे यह जानने का सबसे सस्ता तरीका छिन जाता है कि कौन क्या चलाता है।',

  flag_single_operator: 'पूरे ब्लॉक पर एक ही संचालक',
  fd_single_operator: 'ब्लॉक के सभी रिवर्स नाम एक ही डोमेन पर खत्म होते हैं, यानी पूरी रेंज ग्राहकों में बँटी नहीं, एक ही कंपनी चलाती है।',

  flag_block_wider_than_sweep: 'असली ब्लॉक देखे गए हिस्से से चौड़ा है',
  fd_block_wider_than_sweep: 'रजिस्ट्री या रूटिंग तालिका इस पते को एक जाँच में देखे जा सकने से बड़ी रेंज में रखती है, इसलिए सूचीबद्ध पड़ोसी उसका एक हिस्सा हैं, पूरा नहीं।',

  flag_block_not_enumerable: 'IPv6 ब्लॉक देखा नहीं जा सकता',
  fd_block_not_enumerable: 'एक /64 में अठारह क्विंटिलियन पते होते हैं, इसीलिए IPv6 पर पता-स्कैनिंग होती ही नहीं। केवल वही बताया जा सकता है जो इंडेक्स और प्रमाणपत्र लॉग पहले से जानते हैं।',

  flag_block_too_large: 'ब्लॉक देखने के लिए बहुत बड़ा',
  fd_block_too_large: 'इस पते वाले ब्लॉक में एक जाँच के कनेक्शन खोलने की सीमा से अधिक पते हैं, इसलिए उसे स्वीप सीमा तक सँकरा किया गया।',

  flag_probing_disabled: 'प्रमाणपत्र इकट्ठे नहीं किए गए',
  fd_probing_disabled: 'सक्रिय चरण बंद है, इसलिए यह रिपोर्ट केवल रिवर्स DNS और सार्वजनिक इंडेक्स से बनी है। यह शांत आधा हिस्सा है — और कम पूरा भी।',

  flag_no_reverse_ip_source: 'किसी रिवर्स-IP इंडेक्स ने उत्तर नहीं दिया',
  fd_no_reverse_ip_source: 'इस जाँच के बाहर से कोई नाम नहीं आया, इसलिए यहाँ बिना प्रमाणपत्र और बिना रिवर्स DNS के होस्ट कुछ भी इसे नहीं दिखता।',

  flag_providers_available: 'और स्रोत चालू किए जा सकते हैं',
  fd_providers_available: 'इस इंस्टॉलेशन के पास ऐसे रिवर्स-IP प्रदाता हैं जिनके लिए API कुंजी नहीं दी गई। कुंजी सेट करने पर साझा होस्टिंग की कवरेज काफ़ी बेहतर होती है।',
};

OWN.ar = {
  title: 'جيران العنوان — ماذا يسكن أيضًا على هذا العنوان وفي كتلته',
  title_short: 'جيران العنوان',
  h1: 'جيران العنوان',
  subtitle: 'كل ما يسكن أيضًا على عنوان وفي الكتلة المحيطة به: DNS العكسي، والأسماء المدرجة في كل شهادة، والسجل وجدول التوجيه — وكل اسم يُحلّ من جديد في الاتجاه الأمامي قبل أن يُسمّى جارًا',
  ph_host: '8.8.8.8',
  hero_label: 'العنوان قيد الفحص',
  hero_count: 'مواقع هنا',
  badge_cdn: 'عقدة CDN',
  empty_hint: 'أدخل عنوان IP أو كتلة بصيغة 8.8.8.0-24 أو اسم نطاق. يحدد الفحص أولًا الكتلة التي ينتمي إليها العنوان — نادرًا ما يتفق تخصيص السجل والبادئة المُعلَنة و/24 — ثم يقرأ DNS العكسي لكل عنوان في الكتلة، والشهادة التي يعرضها كل عنوان حين لا يُذكر أي موقع. ثم يُحلّ كل اسم وُجد من جديد: الشهادة تسرد الأسماء التي صدرت لأجلها، لا الأسماء التي ما تزال مستضافة.',

  stage_resolve: 'تحليل العنوان',
  stage_block: 'تحديد الكتلة',
  stage_reverse: 'قراءة DNS العكسي',
  stage_certificates: 'جمع الشهادات',
  stage_passive: 'سؤال الفهارس',
  stage_verify: 'تأكيد كل اسم',
  stage_summary: 'تجميع التقرير',

  card_address: 'هذا العنوان',
  card_block: 'الكتلة',
  card_registry: 'السجل',
  card_routing: 'التوجيه',
  card_here: 'المواقع على هذا العنوان',
  card_neighbors: 'الجيران في الكتلة',
  card_candidates: 'الكتل التي ينتمي إليها العنوان',
  card_unconfirmed: 'مُدّعى ولم يتأكد',

  k_names_here: 'المواقع المؤكدة هنا',
  k_shared: 'عنوان مشترك',
  k_ptr: 'DNS العكسي',
  k_cert_subject: 'موضوع الشهادة',
  k_cert_issuer: 'جهة الإصدار',
  k_server: 'ترويسة Server',
  k_block: 'الكتلة المفحوصة',
  k_block_source: 'اختيرت لأن',
  k_range: 'المدى',
  k_swept: 'العناوين المطروقة',
  k_with_ptr: 'لديها DNS عكسي',
  k_responded: 'استجابت على 443',
  k_net_name: 'اسم الشبكة',
  k_holder: 'الحائز',
  k_net_range: 'التخصيص',
  k_country: 'البلد',
  k_rir: 'السجل',
  k_registered: 'سُجّل',
  k_abuse: 'جهة الإبلاغ عن الإساءة',
  k_asn: 'النظام الذاتي',
  k_as_name: 'المشغّل',
  k_routed_prefix: 'البادئة المُعلَنة',
  k_allocated: 'خُصّص',

  th_name: 'الاسم',
  th_sources: 'وُجد في',
  th_status: 'التأكيد',
  th_address: 'العنوان',
  th_ptr: 'DNS العكسي',
  th_names: 'المواقع',
  th_server: 'الخادم',
  th_block: 'الكتلة',
  th_source: 'المصدر',
  th_size: 'العناوين',
  th_holder: 'الحائز',
  th_points_at: 'يشير الآن إلى',

  empty_here: 'لا اسم يُحلّ إلى هذا العنوان. هذه هي الإجابة المعتادة للبنية التحتية — محلّل، مُرحّل بريد، بوابة NAT — ولموقع يقف خلف وسيط.',
  empty_cdn: 'هذه عقدة في شبكة توصيل محتوى. تستجيب عليها ملايين المواقع غير المترابطة، فلا إجابة مفيدة للسؤال هنا.',
  empty_neighbors: 'لم يستجب شيء في الكتلة، ولا أحد لديه DNS عكسي.',
  empty_unconfirmed: 'كل اسم وُجد يخدمه هذا العنوان في هذه اللحظة.',
  empty_flags: 'لا شيء يستحق الإشارة.',

  /* The shared wording withholds a grade; this service does not have one. */
  incomplete_body: 'بعض الفحوص لم تحصل على إجابة، ولم يُخمَّن شيء أدناه لسد الفراغ. وما ينقص هو:',

  note_address: 'تُحتسب الأسماء التي تُحلّ إلى هذا العنوان الآن فقط. وما تسرده الشهادة هو ادّعاء عن لحظة إصدارها.',
  note_block: 'تُطرق أوسع كتلة تتسع ضمن حد المسح. والكتل الأوسع موصوفة أدناه لكنها لا تُطرق.',
  note_routing: 'تأتي البادئة المُعلَنة من جدول التوجيه العالمي عبر Team Cymru، وهي عادةً أوسع من تخصيص السجل.',
  note_here: 'المصدر هو حيث ظهر الاسم أول مرة، والتأكيد استعلام A أو AAAA أُجري بعد ذلك.',
  note_neighbors: 'اتصال TCP واحد لكل عنوان، إلى المنفذ 443، دون تسمية أي موقع — وهذا بالضبط ما يجعل الخادم يعرض شهادته الافتراضية.',
  note_candidates: 'ثلاث إجابات مختلفة عن «الشبكة الفرعية نفسها»، ولا واحدة منها خاطئة. السجل يقول لمن العنوان، والتوجيه يقول أي شبكة تحمله، و/24 هي الوحدة التي تُباع بها الاستضافة.',
  note_unconfirmed: 'أسماء يربطها مصدر ما بهذا العنوان ولم يعد DNS يربطها. غالبًا موقع انتقل، وأحيانًا شهادة صدرت لنطاق لم يُستضف هنا قط.',

  v_this_one: 'العنوان المسؤول عنه',
  v_uncountable: 'أكثر من أن تُحصى',

  nst_confirmed: 'يُخدَّم هنا',
  nst_in_block: 'في مكان آخر من الكتلة',
  nst_moved: 'انتقل',
  nst_unresolved: 'لم يعد يُحلّ',
  nst_wildcard: 'بدل شامل، لا شيء يُحلّ',
  nst_unchecked: 'لم يُفحص',

  bsrc_registry: 'تخصيص السجل',
  bsrc_routing: 'البادئة المُعلَنة',
  bsrc_conventional: 'الـ/24 المعتاد',
  bsrc_requested: 'أنت طلبتها',

  src_ptr: 'DNS العكسي',
  src_certificate: 'شهادة',
  src_redirect: 'إعادة توجيه',
  src_ct: 'شفافية الشهادات',
  src_hackertarget: 'HackerTarget',
  src_shodan: 'Shodan',
  src_securitytrails: 'SecurityTrails',
  src_viewdns: 'ViewDNS',

  inc_registry: 'لم يستجب السجل',
  inc_routing: 'لم يستجب استعلام التوجيه',
  inc_sweep: 'تعذّر طرق الكتلة',
  inc_certificates: 'لم تُجمع الشهادات',
  inc_reverse_ip: 'لم يستجب أي فهرس عكسي للعناوين',
  inc_verification: 'لم يتسع الوقت لتأكيد الأسماء',
  inc_verification_truncated: 'المرشحون أكثر من حد التأكيد',

  err_invalid_prefix: 'طول البادئة يجب أن يكون رقمًا بين 0 وعرض عائلة العناوين.',
  err_block_too_large: 'تحتوي هذه الكتلة على عناوين أكثر مما يمكن لفحص واحد أن يطرقه. اطلب بادئة أضيق.',

  flag_cdn_edge: 'عقدة CDN لا مضيف',
  fd_cdn_edge: 'العنوان يخص شبكة توصيل محتوى، حيث يقف عنوان واحد واجهةً لعدد هائل من المواقع غير المترابطة. الجوار هنا لا يقول شيئًا عن الملكية، ولذلك لم تُسأل الفهارس.',

  flag_shared_address: 'عدة مواقع تتشارك هذا العنوان',
  fd_shared_address: 'أكثر من ثلاثة أسماء تُحلّ إلى هنا الآن. هذه استضافة مشتركة أو وسيط عكسي، وكل ما عليها يتشارك سمعة العنوان وحدّ المعدل وأي حجب يجلبه أحد الجيران.',

  flag_no_names_confirmed: 'لا اسم يُحلّ إلى هنا',
  fd_no_names_confirmed: 'لم يتأكد شيء مما وُجد عبر DNS. هكذا تبدو البنية التحتية التي لا يسميها أحد، والعنوان خلف وسيط، والعنوان الذي لا يفهرسه أحد.',

  flag_stale_claims: 'معظم ما ادُّعي قد انتقل',
  fd_stale_claims: 'تسمّي المصادر مواقع غادرت أكثر من مواقع بقيت. الشهادات القديمة والفهارس العكسية البائتة تفعل هذا، ومن المفيد معرفته قبل نقل رقم من أي منهما.',

  flag_no_reverse_dns: 'لا DNS عكسي في الكتلة كلها',
  fd_no_reverse_dns: 'لا عنوان واحد في الكتلة يجيب استعلام PTR. أمر شائع في نطاقات السحابة الموزَّعة بالدقيقة، وهو يسلب أرخص وسيلة لمعرفة من يشغّل ماذا.',

  flag_single_operator: 'مشغّل واحد عبر الكتلة',
  fd_single_operator: 'كل الأسماء العكسية في الكتلة تنتهي بالنطاق نفسه، أي أن المدى كله تديره شركة واحدة بدل أن يكون موزعًا على عملاء.',

  flag_block_wider_than_sweep: 'الكتلة الحقيقية أوسع مما طُرق',
  fd_block_wider_than_sweep: 'يضع السجل أو جدول التوجيه هذا العنوان في مدى أكبر مما يمكن لفحص واحد أن يطرقه، فالجيران المدرجون شريحة منه لا كله.',

  flag_block_not_enumerable: 'كتلة IPv6 لا تُطرق',
  fd_block_not_enumerable: 'الـ/64 يضم ثمانية عشر كوينتليون عنوان، ولهذا لا وجود لمسح العناوين في IPv6. لا يمكن الإبلاغ إلا بما تعرفه الفهارس وسجلات الشهادات أصلًا.',

  flag_block_too_large: 'الكتلة أكبر من أن تُطرق',
  fd_block_too_large: 'الكتلة التي تضم هذا العنوان فيها عناوين أكثر مما يفتح فحص واحد اتصالات إليه، فضُيّقت إلى حد المسح.',

  flag_probing_disabled: 'لم تُجمع الشهادات',
  fd_probing_disabled: 'الخطوة النشطة مُعطّلة، فهذا التقرير مبني على DNS العكسي والفهارس العامة وحدها. وهو النصف الأهدأ، والأقل اكتمالًا.',

  flag_no_reverse_ip_source: 'لم يستجب أي فهرس عكسي للعناوين',
  fd_no_reverse_ip_source: 'لم يأت أي اسم من خارج هذا الفحص، فكل ما يُستضاف هنا بلا شهادة وبلا DNS عكسي يبقى غير مرئي له.',

  flag_providers_available: 'يمكن تشغيل مصادر أخرى',
  fd_providers_available: 'لدى هذا التنصيب مزودو فهرسة عكسية بلا مفتاح API مضبوط. وبضبط مفتاح واحد تتحسن تغطية الاستضافة المشتركة تحسنًا ملموسًا.',
};

window.I18N = window.mergeI18N(OWN);
