/* ============================================================
   SportMeet — Store  (localStorage, v7)
   ============================================================ */

/* ── helper de datas relativas ────────────────────────────── */
function _fd(daysOffset, hour, min) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, min || 0, 0, 0);
  const pad = n => String(n).padStart(2,'0');
  return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(hour)+':'+pad(min||0);
}

/* ── helpers de data ──────────────────────────────────────── */
function _parseDT(dt) { return new Date(dt.replace(' ','T')); }
const DOW_LABELS = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
const MON_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MON_FULL   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function dtDow(dt)    { return DOW_LABELS[_parseDT(dt).getDay()]; }
function dtDay(dt)    { return _parseDT(dt).getDate(); }
function dtTime(dt)   { const d=_parseDT(dt); return pad(d.getHours())+':'+pad(d.getMinutes()); }
function dtMonth(dt)  { return MON_LABELS[_parseDT(dt).getMonth()]; }
function dtFull(dt)   { const d=_parseDT(dt); return DOW_LABELS[d.getDay()]+', '+d.getDate()+' de '+MON_LABELS[d.getMonth()]+' · '+pad(d.getHours())+':'+pad(d.getMinutes()); }
function dtShort(dt)  { return dtDow(dt)+' · '+dtTime(dt); }
function dtDate(dt)   { const d=_parseDT(dt); return d.getDate()+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear(); }
function pad(n)       { return String(n).padStart(2,'0'); }
function uid()        { return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

/* ── Atividades / esportes (para autocomplete) ─────────── */
const SP_ACTIVITIES = [
  {name:'Futebol',     slug:'futebol',    emoji:'⚽', gradient:'linear-gradient(135deg,#22C55E,#15803D)'},
  {name:'Corrida',     slug:'corrida',    emoji:'🏃', gradient:'linear-gradient(135deg,#22C55E,#059669)'},
  {name:'Basquete',    slug:'basquete',   emoji:'🏀', gradient:'linear-gradient(135deg,#8B5CF6,#6D28D9)'},
  {name:'Tênis',       slug:'tênis',      emoji:'🎾', gradient:'linear-gradient(135deg,#F97316,#C2410C)'},
  {name:'Natação',     slug:'natação',    emoji:'🏊', gradient:'linear-gradient(135deg,#06B6D4,#0E7490)'},
  {name:'Vôlei',       slug:'vôlei',      emoji:'🏐', gradient:'linear-gradient(135deg,#EAB308,#B45309)'},
  {name:'Ciclismo',    slug:'ciclismo',   emoji:'🚴', gradient:'linear-gradient(135deg,#3B82F6,#1D4ED8)'},
  {name:'Yoga',        slug:'yoga',       emoji:'🧘', gradient:'linear-gradient(135deg,#EC4899,#BE185D)'},
  {name:'Escalada',    slug:'escalada',   emoji:'🧗', gradient:'linear-gradient(135deg,#6B7280,#374151)'},
  {name:'Capoeira',    slug:'capoeira',   emoji:'🥋', gradient:'linear-gradient(135deg,#F59E0B,#B45309)'},
  {name:'Handebol',    slug:'handebol',   emoji:'🤾', gradient:'linear-gradient(135deg,#DC2626,#991B1B)'},
  {name:'Musculação',  slug:'musculação', emoji:'💪', gradient:'linear-gradient(135deg,#6B7280,#374151)'},
  {name:'Crossfit',    slug:'crossfit',   emoji:'🏋️', gradient:'linear-gradient(135deg,#F97316,#C2410C)'},
  {name:'Surf',        slug:'surf',       emoji:'🏄', gradient:'linear-gradient(135deg,#06B6D4,#0E7490)'},
  {name:'Skate',       slug:'skate',      emoji:'🛹', gradient:'linear-gradient(135deg,#8B5CF6,#6D28D9)'},
  {name:'Boxe',        slug:'boxe',       emoji:'🥊', gradient:'linear-gradient(135deg,#DC2626,#991B1B)'},
  {name:'Jiu-jitsu',   slug:'jiujitsu',   emoji:'🥋', gradient:'linear-gradient(135deg,#374151,#111827)'},
  {name:'Dança',       slug:'dança',      emoji:'💃', gradient:'linear-gradient(135deg,#EC4899,#BE185D)'},
  {name:'Ping-pong',   slug:'pingpong',   emoji:'🏓', gradient:'linear-gradient(135deg,#F97316,#C2410C)'},
  {name:'Badminton',   slug:'badminton',  emoji:'🏸', gradient:'linear-gradient(135deg,#22C55E,#059669)'},
  {name:'Rugby',       slug:'rugby',      emoji:'🏉', gradient:'linear-gradient(135deg,#22C55E,#166534)'},
  {name:'Golf',        slug:'golf',       emoji:'⛳', gradient:'linear-gradient(135deg,#22C55E,#15803D)'},
  {name:'Trail',       slug:'trail',      emoji:'🏔️', gradient:'linear-gradient(135deg,#059669,#065F46)'},
  {name:'Patinação',   slug:'patinação',  emoji:'⛸️', gradient:'linear-gradient(135deg,#06B6D4,#0E7490)'},
  {name:'Outro',       slug:'outro',      emoji:'🏅', gradient:'linear-gradient(135deg,#6B7280,#374151)'},
];

/* ── Bairros de SP (para autocomplete de localização) ─── */
const SP_BAIRROS = [
  'Aclimação','Alto da Lapa','Alto de Pinheiros','Barra Funda','Bela Vista',
  'Belenzinho','Bom Retiro','Brás','Brooklin','Butantã',
  'Cambuci','Campo Belo','Campo Grande','Centro','Consolação',
  'Freguesia do Ó','Higienópolis','Ipiranga','Itaim Bibi','Itaim Paulista',
  'Jabaquara','Jardim América','Jardim Anália Franco','Jardim Europa','Jardim Paulista',
  'Lapa','Liberdade','Mandaqui','Moema','Morumbi',
  'Paraíso','Penha','Perdizes','Pinheiros',
  'Pirituba','Pompéia','República','Sacomã','Santa Cecília',
  'Santana','Saúde','Tatuapé','Tucuruvi','Vila Andrade',
  'Vila Mariana','Vila Madalena','Vila Nova Conceição','Vila Olímpia','Vila Prudente',
  'Vila Sônia','Zona Leste','Zona Norte','Zona Oeste','Zona Sul',
];

/* ── Lugares de SP (para autocomplete) ─────────────────── */
const SP_LOCATIONS = [
  {name:'Parque Ibirapuera',             address:'Av. Pedro Álvares Cabral, s/n',          region:'Moema'},
  {name:'Parque Villa-Lobos',            address:'Av. Prof. Fonseca Rodrigues, 2001',       region:'Lapa'},
  {name:'SESC Pompéia',                  address:'Rua Clélia, 93',                          region:'Lapa'},
  {name:'SESC Vila Mariana',             address:'Rua Pelotas, 141',                        region:'Vila Mariana'},
  {name:'SESC Pinheiros',                address:'Rua Paes Leme, 195',                      region:'Pinheiros'},
  {name:'SESC Interlagos',               address:'Av. Manoel Alves Rezende, 150',           region:'Zona Sul'},
  {name:'Quadra Brooklin',               address:'Av. Morumbi, 123',                        region:'Brooklin'},
  {name:'Arena Society Brooklin',        address:'Rua Álvaro Cruz, 300',                    region:'Brooklin'},
  {name:'Quadra Coberta Brooklin',       address:'Rua Barão do Trinfo, 121',                region:'Brooklin'},
  {name:'Clube Esportivo Pinheiros',     address:'Rua Gomes de Carvalho, 500',              region:'Itaim Bibi'},
  {name:'Clube Itaim',                   address:'R. Joaquim Floriano, 400',                region:'Itaim Bibi'},
  {name:'Clube Lapa',                    address:'Rua Ministro Godoi, 1000',                region:'Lapa'},
  {name:'Clube de Regatas Tietê',        address:'Av. Marginal Tietê, 5700',                region:'Zona Norte'},
  {name:'Parque do Povo',                address:'Av. Brigadeiro Faria Lima, s/n',          region:'Itaim Bibi'},
  {name:'Parque da Aclimação',           address:'Rua Muniz de Souza, 1119',                region:'Aclimação'},
  {name:'Centro Cultural SP',            address:'Rua Vergueiro, 1000',                     region:'Paraíso'},
  {name:'Av. Paulista — MASP',           address:'Av. Paulista, 1578',                      region:'Bela Vista'},
  {name:'Pico do Jaraguá',               address:'Estrada do Jaraguá, km 5',                region:'Jaraguá'},
  {name:'Boulder Brasil Morumbi',        address:'Av. Giovanni Gronchi, 5750',              region:'Morumbi'},
  {name:'Ginásio da Aclimação',          address:'Parque da Aclimação, Portão 1',           region:'Aclimação'},
  {name:'Quadra Moema',                  address:'Av. Moaci, 300',                          region:'Moema'},
  {name:'Quadra Moema Park',             address:'Av. Moaci, 1000',                         region:'Moema'},
  {name:'Campo Society Lapa',            address:'Rua Cerro Corá, 900',                     region:'Lapa'},
  {name:'Velódromo do Ibirapuera',       address:'Parque Ibirapuera, Portão 2',             region:'Moema'},
  {name:'Quadra Vila Olímpia',           address:'Rua Funchal, 200',                        region:'Vila Olímpia'},
  {name:'Quadra Jardim Paulista',        address:'Al. Casa Branca, 800',                    region:'Jardins'},
  {name:'SmartFit Faria Lima',           address:'Av. Brig. Faria Lima, 2232',              region:'Itaim Bibi'},
  {name:'SmartFit Paulista',             address:'Av. Paulista, 807',                       region:'Bela Vista'},
  {name:'Bodytech Itaim',                address:'Rua Funchal, 418',                        region:'Itaim Bibi'},
  {name:'Bio Ritmo Pinheiros',           address:'Rua dos Pinheiros, 498',                  region:'Pinheiros'},
  {name:'CEPEUSP',                       address:'Rua do Anfiteatro, 181, Cidade Univ.',    region:'Butantã'},
  {name:'Estádio do Morumbi',            address:'Praça Roberto Gomes Pedrosa, 1',          region:'Morumbi'},
  {name:'Arena Corinthians',             address:'Av. Miguel Ignácio Curi, 111',             region:'Zona Leste'},
  {name:'Tennis Club SP',                address:'Rua Hungria, 843',                        region:'Jardins'},
  {name:'Hípica Paulista',               address:'Av. João Filgueiras Lima, 210',            region:'Butantã'},
  {name:'Autódromo de Interlagos',       address:'Av. Senador Teotônio Vilela, 315',        region:'Zona Sul'},
  {name:'Parque Burle Marx',             address:'Av. Dona Helena P. de Morais, 200',       region:'Morumbi'},
  {name:'Parque Linear Aricanduva',      address:'Av. Aricanduva, s/n',                     region:'Zona Leste'},
  {name:'Parque Carmo',                  address:'Av. Afonso de Sampaio e Sousa, 951',      region:'Zona Leste'},
  {name:'Parque Estadual Cantareira',    address:'Estrada Pico do Jaraguá, km 3',           region:'Zona Norte'},
  {name:'Ginásio do Ibirapuera',         address:'Parque Ibirapuera, Portão 7',             region:'Moema'},
  {name:'Centro Esportivo Mirandópolis', address:'Rua Vergueiro, 6000',                     region:'Saúde'},
  {name:'Arena Brasil Futebol',          address:'Rua Sílvia, 254, Bela Vista',             region:'Bela Vista'},
  {name:'FIEC Esportes',                 address:'Rua Tagipuru, 235, Barra Funda',          region:'Barra Funda'},
  {name:'Clube Athletico Paulistano',    address:'Rua Honduras, 1400, Jardim América',      region:'Jardins'},
  {name:'Clube Sírio',                   address:'Rua São Tomé, 86, Vila Nova Conceição',   region:'Vila Nova Conceição'},
  {name:'Parque Trianon',                address:'Av. Paulista, 1351',                      region:'Bela Vista'},
  {name:'Piscina Municipal Moema',       address:'Av. Jurucê, 365',                         region:'Moema'},
  {name:'Parque Estadual Serra do Mar',  address:'Rod. Anchieta, km 40',                    region:'Litoral'},
  {name:'Raia Olímpica USP',             address:'Av. Prof. Mello Moraes, 650',             region:'Butantã'},
];

/* ── Eventos dos amigos ────────────────────────────────── */
const FRIEND_EVENTS = {
  'fr-1': [
    { id:'fev-b1', title:'Futsal Semanal',    sport:'⚽', sportSlug:'futebol',  gradient:'linear-gradient(135deg,#22C55E,#15803D)', ageRange:'20-30 anos', datetime:_fd(2,20),    duration:'1h',    local:'Campo Society Lapa',    address:'Rua Cerro Corá, 900',     region:'Lapa',    period:'noite', createdBy:'Bruno',  creatorInitial:'B', creatorColor:'av-purple', description:'Pelada semanal de futsal. Todos bem-vindos!',             maxParticipants:14, participants:[{i:'B',c:'av-purple',name:'Bruno'},{i:'L',c:'av-green',name:'Lucas'},{i:'P',c:'av-teal',name:'Pedro'}], isOpen:true, status:'active', source:'created' },
    { id:'fev-b2', title:'Corrida no Povo',   sport:'🏃', sportSlug:'corrida',  gradient:'linear-gradient(135deg,#22C55E,#059669)', ageRange:'Todos',      datetime:_fd(3,7),     duration:'45min', local:'Parque do Povo',        address:'Av. Brig. Faria Lima, s/n',region:'Itaim Bibi', period:'manhã', createdBy:'Bruno',  creatorInitial:'B', creatorColor:'av-purple', description:'Corrida leve às margens do parque. 3 km.',                maxParticipants:10, participants:[{i:'B',c:'av-purple',name:'Bruno'},{i:'A',c:'av-pink',name:'Alice'}], isOpen:true, status:'active', source:'created' },
  ],
  'fr-2': [
    { id:'fev-a1', title:'Corrida Feminina',  sport:'🏃', sportSlug:'corrida',  gradient:'linear-gradient(135deg,#EC4899,#BE185D)', ageRange:'Mulheres',   datetime:_fd(1,8),     duration:'1h',    local:'Parque Ibirapuera',     address:'Portão 5, Parque Ibirapuera',region:'Moema',period:'manhã', createdBy:'Alice',  creatorInitial:'A', creatorColor:'av-pink',   description:'Corrida para mulheres de todos os níveis. Ritmo livre!', maxParticipants:15, participants:[{i:'A',c:'av-pink',name:'Alice'},{i:'M',c:'av-blue',name:'Marina'},{i:'C',c:'av-orange',name:'Camila'}], isOpen:true, status:'active', source:'created' },
    { id:'fev-a2', title:'5K Paulista',       sport:'🏃', sportSlug:'corrida',  gradient:'linear-gradient(135deg,#3B82F6,#1D4ED8)', ageRange:'18-40 anos', datetime:_fd(5,7,30),  duration:'1h',    local:'Av. Paulista — MASP',   address:'Av. Paulista, 1578',  region:'Bela Vista',  period:'manhã', createdBy:'Alice',  creatorInitial:'A', creatorColor:'av-pink',   description:'Corrida no domingo de manhã pela Paulista fechada.',      maxParticipants:30, participants:[{i:'A',c:'av-pink',name:'Alice'}], isOpen:true, status:'active', source:'created' },
  ],
  'fr-3': [
    { id:'fev-c1', title:'Pedalada Parque',   sport:'🚴', sportSlug:'ciclismo', gradient:'linear-gradient(135deg,#3B82F6,#1D4ED8)', ageRange:'18-40 anos', datetime:_fd(1,8),     duration:'2h',    local:'Parque Villa-Lobos',    address:'Av. Prof. Fonseca Rod., 2001',region:'Lapa',period:'manhã', createdBy:'Carlos', creatorInitial:'C', creatorColor:'av-teal',   description:'Pedalada em grupo de 20 km. Ritmo moderado.',             maxParticipants:20, participants:[{i:'C',c:'av-teal',name:'Carlos'},{i:'B',c:'av-purple',name:'Bruno'}], isOpen:true, status:'active', source:'created' },
  ],
  'fr-4': [
    { id:'fev-cam1', title:'Yoga Sunset',     sport:'🧘', sportSlug:'yoga',     gradient:'linear-gradient(135deg,#EC4899,#BE185D)', ageRange:'Todos',      datetime:_fd(3,18,30), duration:'1h',    local:'Parque Ibirapuera',     address:'Portão 3, Parque Ibirapuera',region:'Moema',period:'noite', createdBy:'Camila', creatorInitial:'C', creatorColor:'av-orange', description:'Yoga ao pôr do sol. Traga seu tapete!',                   maxParticipants:15, participants:[{i:'C',c:'av-orange',name:'Camila'},{i:'A',c:'av-pink',name:'Alice'},{i:'M',c:'av-blue',name:'Marina'}], isOpen:true, status:'active', source:'created' },
    { id:'fev-cam2', title:'Meditação Manhã', sport:'🧘', sportSlug:'yoga',     gradient:'linear-gradient(135deg,#8B5CF6,#6D28D9)', ageRange:'Todos',      datetime:_fd(4,7),     duration:'45min', local:'Parque Trianon',        address:'Av. Paulista, 1351',  region:'Bela Vista',  period:'manhã', createdBy:'Camila', creatorInitial:'C', creatorColor:'av-orange', description:'Meditação guiada no parque. Paz e equilíbrio.',           maxParticipants:10, participants:[{i:'C',c:'av-orange',name:'Camila'}], isOpen:true, status:'active', source:'created' },
  ],
  'fr-5': [
    { id:'fev-l1', title:'Futebol Brooklin',  sport:'⚽', sportSlug:'futebol',  gradient:'linear-gradient(135deg,#22C55E,#166534)', ageRange:'20-30 anos', datetime:_fd(5,19),    duration:'1h30',  local:'Arena Society Brooklin',address:'Rua Álvaro Cruz, 300',  region:'Brooklin',period:'noite', createdBy:'Lucas',  creatorInitial:'L', creatorColor:'av-green',  description:'Racha semanal society. Times de 7.',                      maxParticipants:14, participants:[{i:'L',c:'av-green',name:'Lucas'},{i:'B',c:'av-purple',name:'Bruno'},{i:'G',c:'av-teal',name:'Gabriel'},{i:'R',c:'av-blue',name:'Rodrigo'}], isOpen:true, status:'active', source:'created' },
    { id:'fev-l2', title:'Fut7 Fim de Sem.',  sport:'⚽', sportSlug:'futebol',  gradient:'linear-gradient(135deg,#22C55E,#15803D)', ageRange:'18-35 anos', datetime:_fd(6,10),    duration:'2h',    local:'Campo Society Lapa',    address:'Rua Cerro Corá, 900',   region:'Lapa',    period:'manhã', createdBy:'Lucas',  creatorInitial:'L', creatorColor:'av-green',  description:'Futebol de 7 no fim de semana. Vagas abertas.',           maxParticipants:14, participants:[{i:'L',c:'av-green',name:'Lucas'}], isOpen:true, status:'active', source:'created' },
  ],
  'fr-6': [
    { id:'fev-m1', title:'Natação Livre',     sport:'🏊', sportSlug:'natação',  gradient:'linear-gradient(135deg,#06B6D4,#0E7490)', ageRange:'18-40 anos', datetime:_fd(4,7),     duration:'1h',    local:'SESC Pompéia',          address:'Rua Clélia, 93',        region:'Lapa',    period:'manhã', createdBy:'Marina', creatorInitial:'M', creatorColor:'av-blue',   description:'Raia livre. Traga touca e óculos de natação.',            maxParticipants:20, participants:[{i:'M',c:'av-blue',name:'Marina'},{i:'A',c:'av-pink',name:'Alice'}], isOpen:true, status:'active', source:'created' },
  ],
};

/* ── pools de dados estáticos ────────────────────────────── */
const FEED_POOL = [
  /* ── Originais ── */
  { id:'fd-1',  title:'Corrida no Parque',       sport:'🏃', sportSlug:'corrida',   gradient:'linear-gradient(135deg,#22C55E,#15803D)', ageRange:'20-30 anos', datetime:_fd(1,7),     duration:'1h',    local:'Parque Ibirapuera',           address:'Portão 5, Parque Ibirapuera',         region:'Moema',       period:'manhã', createdBy:'Pedro',    creatorInitial:'P', creatorColor:'av-orange', description:'Corrida em grupo, ritmo confortável. Todos os níveis!',                                maxParticipants:20, participants:[{i:'P',c:'av-orange',name:'Pedro'}], isOpen:true },
  { id:'fd-2',  title:'Tênis no Clube',           sport:'🎾', sportSlug:'tênis',     gradient:'linear-gradient(135deg,#F97316,#C2410C)', ageRange:'25-35 anos', datetime:_fd(3,19,30), duration:'1h30',  local:'Clube Esportivo Pinheiros',    address:'Rua Gomes de Carvalho, 500',           region:'Itaim Bibi',  period:'noite', createdBy:'Ana',      creatorInitial:'A', creatorColor:'av-pink',   description:'Jogo de duplas. Nível intermediário. Raquetes disponíveis.',                           maxParticipants:4,  participants:[{i:'A',c:'av-pink',name:'Ana'},{i:'R',c:'av-blue',name:'Rodrigo'}], isOpen:true },
  { id:'fd-3',  title:'Basquete 3×3',             sport:'🏀', sportSlug:'basquete',  gradient:'linear-gradient(135deg,#8B5CF6,#6D28D9)', ageRange:'18-30 anos', datetime:_fd(4,18),    duration:'2h',    local:'Quadra Brooklin',              address:'Av. Morumbi, 123',                     region:'Brooklin',    period:'noite', createdBy:'Lucas',    creatorInitial:'L', creatorColor:'av-green',  description:'Racha animado 3×3. Galera boa e sem frescura.',                                        maxParticipants:12, participants:[{i:'L',c:'av-green',name:'Lucas'},{i:'G',c:'av-teal',name:'Gabriel'},{i:'M',c:'av-blue',name:'Marina'}], isOpen:true },
  { id:'fd-4',  title:'Natação Livre',             sport:'🏊', sportSlug:'natação',   gradient:'linear-gradient(135deg,#06B6D4,#0E7490)', ageRange:'Todos',      datetime:_fd(6,6,30),  duration:'1h',    local:'SESC Pompéia',                 address:'Rua Clélia, 93, Pompéia',              region:'Lapa',        period:'manhã', createdBy:'Camila',   creatorInitial:'C', creatorColor:'av-teal',   description:'Raia livre aberta. Traga touca e óculos de natação.',                                  maxParticipants:30, participants:[{i:'C',c:'av-teal',name:'Carlos'}], isOpen:true },
  { id:'fd-5',  title:'Vôlei na Praia',            sport:'🏐', sportSlug:'vôlei',     gradient:'linear-gradient(135deg,#EAB308,#B45309)', ageRange:'Aberto',     datetime:_fd(1,9),     duration:'2h',    local:'Parque Villa-Lobos',           address:'Av. Prof. Fonseca Rodrigues, 2001',    region:'Lapa',        period:'manhã', createdBy:'Rafael',   creatorInitial:'R', creatorColor:'av-yellow', description:'Pelada de vôlei de areia. 6×6! Vaga aberta.',                                          maxParticipants:12, participants:[{i:'R',c:'av-yellow',name:'Rafael'},{i:'B',c:'av-blue',name:'Beatriz'},{i:'F',c:'av-green',name:'Felipe'}], isOpen:true },
  { id:'fd-6',  title:'Ciclismo Urbano',            sport:'🚴', sportSlug:'ciclismo',  gradient:'linear-gradient(135deg,#3B82F6,#1D4ED8)', ageRange:'18-40 anos', datetime:_fd(2,8),     duration:'2h',    local:'Av. Paulista — MASP',          address:'Av. Paulista, 1578',                   region:'Bela Vista',  period:'manhã', createdBy:'Felipe',   creatorInitial:'F', creatorColor:'av-blue',   description:'Pedalada urbana de 20 km. Ritmo moderado. Capacete obrigatório.',                      maxParticipants:25, participants:[{i:'F',c:'av-blue',name:'Felipe'},{i:'J',c:'av-teal',name:'Joao'}], isOpen:true },
  { id:'fd-7',  title:'Yoga ao Ar Livre',           sport:'🧘', sportSlug:'yoga',      gradient:'linear-gradient(135deg,#EC4899,#BE185D)', ageRange:'Todos',      datetime:_fd(2,7,30),  duration:'1h',    local:'Parque Villa-Lobos',           address:'Av. Prof. Fonseca Rodrigues, 2001',    region:'Lapa',        period:'manhã', createdBy:'Sofia',    creatorInitial:'S', creatorColor:'av-pink',   description:'Yoga para todos os níveis em contato com a natureza. Traga seu tapete.',               maxParticipants:20, participants:[{i:'S',c:'av-pink',name:'Sofia'},{i:'L',c:'av-orange',name:'Luana'}], isOpen:true },
  { id:'fd-8',  title:'Futebol Society',            sport:'⚽', sportSlug:'futebol',   gradient:'linear-gradient(135deg,#22C55E,#166534)', ageRange:'20-35 anos', datetime:_fd(1,20),    duration:'1h30',  local:'Arena Society Brooklin',       address:'Rua Álvaro Cruz, 300',                 region:'Brooklin',    period:'noite', createdBy:'Marcos',   creatorInitial:'M', creatorColor:'av-green',  description:'Pelada society. Times de 7 jogadores. Chuteira obrigatória.',                          maxParticipants:14, participants:[{i:'M',c:'av-green',name:'Marcos'},{i:'D',c:'av-blue',name:'Diego'},{i:'R',c:'av-purple',name:'Rafael'}], isOpen:true },
  { id:'fd-9',  title:'Escalada Indoor',            sport:'🧗', sportSlug:'escalada',  gradient:'linear-gradient(135deg,#6B7280,#374151)', ageRange:'Todos',      datetime:_fd(7,15),    duration:'2h',    local:'Boulder Brasil Morumbi',       address:'Av. Giovanni Gronchi, 5750',           region:'Morumbi',     period:'tarde', createdBy:'Thiago',   creatorInitial:'T', creatorColor:'av-purple', description:'Escalada em bloco para todos os níveis. Sapatos para aluguel.',                         maxParticipants:10, participants:[{i:'T',c:'av-purple',name:'Thiago'}], isOpen:true },
  { id:'fd-10', title:'Capoeira no Parque',         sport:'🥋', sportSlug:'capoeira',  gradient:'linear-gradient(135deg,#F59E0B,#B45309)', ageRange:'18-45 anos', datetime:_fd(5,19),    duration:'1h30',  local:'Centro Cultural SP',           address:'Rua Vergueiro, 1000',                  region:'Paraíso',     period:'noite', createdBy:'Luiz',     creatorInitial:'L', creatorColor:'av-orange', description:'Roda aberta de capoeira. Berimbau, atabaque e muita energia!',                          maxParticipants:30, participants:[{i:'L',c:'av-orange',name:'Luana'},{i:'P',c:'av-green',name:'Paulo'}], isOpen:true },
  { id:'fd-11', title:'Corrida de Montanha',        sport:'🏔️',sportSlug:'corrida',   gradient:'linear-gradient(135deg,#059669,#065F46)', ageRange:'20-40 anos', datetime:_fd(8,6),     duration:'3h',    local:'Pico do Jaraguá',              address:'Estrada do Jaraguá, km 5',             region:'Jaraguá',     period:'manhã', createdBy:'André',    creatorInitial:'A', creatorColor:'av-green',  description:'Trail running no Jaraguá. Nível intermediário. Traga hidratação.',                     maxParticipants:15, participants:[{i:'A',c:'av-green',name:'Andre'}], isOpen:true },
  { id:'fd-12', title:'Handebol Recreativo',        sport:'🤾', sportSlug:'handebol',  gradient:'linear-gradient(135deg,#DC2626,#991B1B)', ageRange:'18-35 anos', datetime:_fd(7,10),    duration:'1h30',  local:'Ginásio da Aclimação',         address:'Parque da Aclimação, Portão 1',        region:'Aclimação',   period:'manhã', createdBy:'Bruna',    creatorInitial:'B', creatorColor:'av-red',    description:'Jogo recreativo de handebol. Sem experiência necessária.',                              maxParticipants:14, participants:[{i:'B',c:'av-red',name:'Bruna'}], isOpen:true },
  /* ── Novos (40 total) ── */
  { id:'fd-13', title:'Futsal Pinheiros',           sport:'⚽', sportSlug:'futebol',   gradient:'linear-gradient(135deg,#22C55E,#15803D)', ageRange:'18-35 anos', datetime:_fd(2,19,30), duration:'1h',    local:'SESC Pinheiros',               address:'Rua Paes Leme, 195',                   region:'Pinheiros',   period:'noite', createdBy:'Gabriel',  creatorInitial:'G', creatorColor:'av-teal',   description:'Pelada semanal de futsal. Times de 5.',                                                maxParticipants:10, participants:[{i:'G',c:'av-teal',name:'Gabriel'},{i:'R',c:'av-purple',name:'Rodrigo'}], isOpen:true },
  { id:'fd-14', title:'Fut Society Moema',          sport:'⚽', sportSlug:'futebol',   gradient:'linear-gradient(135deg,#22C55E,#166534)', ageRange:'20-30 anos', datetime:_fd(3,20),    duration:'1h30',  local:'Quadra Moema',                 address:'Av. Moaci, 300',                       region:'Moema',       period:'noite', createdBy:'Rodrigo',  creatorInitial:'R', creatorColor:'av-blue',   description:'Racha de society. Vagas abertas para meias e goleiros.',                               maxParticipants:14, participants:[{i:'R',c:'av-blue',name:'Rodrigo'},{i:'D',c:'av-teal',name:'Diego'},{i:'P',c:'av-orange',name:'Pedro'},{i:'F',c:'av-green',name:'Felipe'}], isOpen:true },
  { id:'fd-15', title:'Corrida 5K Aclimação',       sport:'🏃', sportSlug:'corrida',   gradient:'linear-gradient(135deg,#22C55E,#059669)', ageRange:'Todos',      datetime:_fd(3,7,30),  duration:'45min', local:'Parque da Aclimação',          address:'Rua Muniz de Souza, 1119',             region:'Aclimação',   period:'manhã', createdBy:'Fernanda', creatorInitial:'F', creatorColor:'av-pink',   description:'Corrida matinal de 5km. Grupo de qualquer nível!',                                     maxParticipants:25, participants:[{i:'F',c:'av-pink',name:'Fernanda'},{i:'K',c:'av-purple',name:'Karen'}], isOpen:true },
  { id:'fd-16', title:'Treino Paulista',             sport:'🏃', sportSlug:'corrida',   gradient:'linear-gradient(135deg,#3B82F6,#1D4ED8)', ageRange:'20-40 anos', datetime:_fd(5,6,30),  duration:'1h',    local:'Av. Paulista — MASP',          address:'Av. Paulista, 1578',                   region:'Bela Vista',  period:'manhã', createdBy:'Ricardo',  creatorInitial:'R', creatorColor:'av-blue',   description:'Treino intervalado na Paulista fechada. Todos os ritmos.',                             maxParticipants:20, participants:[{i:'R',c:'av-blue',name:'Ricardo'}], isOpen:true },
  { id:'fd-17', title:'Trail Cantareira',            sport:'🏔️',sportSlug:'corrida',   gradient:'linear-gradient(135deg,#059669,#065F46)', ageRange:'20-45 anos', datetime:_fd(9,7),     duration:'3h',    local:'Parque Estadual Cantareira',   address:'Estrada Pico do Jaraguá, km 3',        region:'Zona Norte',  period:'manhã', createdBy:'André',    creatorInitial:'A', creatorColor:'av-green',  description:'Trail running leve na Cantareira. 8km total. Levar água.',                             maxParticipants:12, participants:[{i:'A',c:'av-green',name:'André'},{i:'T',c:'av-purple',name:'Thiago'}], isOpen:true },
  { id:'fd-18', title:'Basquete Ibirapuera',         sport:'🏀', sportSlug:'basquete',  gradient:'linear-gradient(135deg,#8B5CF6,#6D28D9)', ageRange:'18-35 anos', datetime:_fd(2,17),    duration:'1h30',  local:'Ginásio do Ibirapuera',        address:'Parque Ibirapuera, Portão 7',          region:'Moema',       period:'tarde', createdBy:'Diego',    creatorInitial:'D', creatorColor:'av-blue',   description:'Jogo amistoso 5×5 no Ibirapuera. Boa galera!',                                         maxParticipants:10, participants:[{i:'D',c:'av-blue',name:'Diego'},{i:'M',c:'av-green',name:'Marcos'}], isOpen:true },
  { id:'fd-19', title:'Street Basketball 3×3',      sport:'🏀', sportSlug:'basquete',  gradient:'linear-gradient(135deg,#F97316,#C2410C)', ageRange:'16-30 anos', datetime:_fd(4,15),    duration:'2h',    local:'Quadra Vila Olímpia',          address:'Rua Funchal, 200',                     region:'Vila Olímpia',period:'tarde', createdBy:'Gabriel',  creatorInitial:'G', creatorColor:'av-teal',   description:'Street basketball 3×3. Habilidade técnica bem-vinda!',                                maxParticipants:12, participants:[{i:'G',c:'av-teal',name:'Gabriel'}], isOpen:true },
  { id:'fd-20', title:'Natação USP',                 sport:'🏊', sportSlug:'natação',   gradient:'linear-gradient(135deg,#06B6D4,#0E7490)', ageRange:'18-50 anos', datetime:_fd(5,7),     duration:'1h',    local:'Raia Olímpica USP',            address:'Av. Prof. Mello Moraes, 650',          region:'Butantã',     period:'manhã', createdBy:'Paulo',    creatorInitial:'P', creatorColor:'av-green',  description:'Nado livre em raia olímpica. Nível intermediário.',                                    maxParticipants:15, participants:[{i:'P',c:'av-green',name:'Paulo'}], isOpen:true },
  { id:'fd-21', title:'Tênis Duplas Jardins',        sport:'🎾', sportSlug:'tênis',     gradient:'linear-gradient(135deg,#F97316,#C2410C)', ageRange:'25-40 anos', datetime:_fd(4,9),     duration:'1h30',  local:'Clube Athletico Paulistano',   address:'Rua Honduras, 1400',                   region:'Jardins',     period:'manhã', createdBy:'Ana',      creatorInitial:'A', creatorColor:'av-pink',   description:'Jogo de duplas mistas. Nível intermediário a avançado.',                               maxParticipants:4,  participants:[{i:'A',c:'av-pink',name:'Ana'},{i:'R',c:'av-blue',name:'Roberto'}], isOpen:true },
  { id:'fd-22', title:'Acroyoga Pinheiros',          sport:'🧘', sportSlug:'yoga',      gradient:'linear-gradient(135deg,#EC4899,#BE185D)', ageRange:'Todos',      datetime:_fd(4,10,30), duration:'1h30',  local:'SESC Pinheiros',               address:'Rua Paes Leme, 195',                   region:'Pinheiros',   period:'manhã', createdBy:'Isabela',  creatorInitial:'I', creatorColor:'av-pink',   description:'Acroyoga para iniciantes. Venha em dupla ou sozinho!',                                 maxParticipants:14, participants:[{i:'I',c:'av-pink',name:'Isabela'},{i:'J',c:'av-teal',name:'Julia'}], isOpen:true },
  { id:'fd-23', title:'Ciclismo Ibirapuera',         sport:'🚴', sportSlug:'ciclismo',  gradient:'linear-gradient(135deg,#3B82F6,#1D4ED8)', ageRange:'Todos',      datetime:_fd(6,7),     duration:'1h30',  local:'Parque Ibirapuera',            address:'Portão 7, Parque Ibirapuera',          region:'Moema',       period:'manhã', createdBy:'Carlos',   creatorInitial:'C', creatorColor:'av-teal',   description:'Pedalada em grupo ao redor do Ibirapuera. 3 voltas.',                                  maxParticipants:20, participants:[{i:'C',c:'av-teal',name:'Carlos'},{i:'B',c:'av-purple',name:'Bruno'}], isOpen:true },
  { id:'fd-24', title:'Vôlei de Praia Vila Olímpia', sport:'🏐', sportSlug:'vôlei',     gradient:'linear-gradient(135deg,#EAB308,#B45309)', ageRange:'20-35 anos', datetime:_fd(1,10),    duration:'2h',    local:'Quadra Vila Olímpia',          address:'Rua Funchal, 200',                     region:'Vila Olímpia',period:'manhã', createdBy:'Beatriz',  creatorInitial:'B', creatorColor:'av-yellow', description:'Pelada de vôlei de areia 4×4. Galera descontraída.',                                   maxParticipants:8,  participants:[{i:'B',c:'av-yellow',name:'Beatriz'},{i:'C',c:'av-pink',name:'Carla'}], isOpen:true },
  { id:'fd-25', title:'Vôlei Indoor Moema',          sport:'🏐', sportSlug:'vôlei',     gradient:'linear-gradient(135deg,#EAB308,#B45309)', ageRange:'18-40 anos', datetime:_fd(3,19),    duration:'1h30',  local:'Quadra Moema Park',            address:'Av. Moaci, 1000',                      region:'Moema',       period:'noite', createdBy:'Rafael',   creatorInitial:'R', creatorColor:'av-yellow', description:'Pelada indoor 6×6. Vaga aberta para levantadores.',                                    maxParticipants:12, participants:[{i:'R',c:'av-yellow',name:'Rafael'},{i:'F',c:'av-green',name:'Felipe'}], isOpen:true },
  { id:'fd-26', title:'Treino Funcional Itaim',      sport:'💪', sportSlug:'musculação',gradient:'linear-gradient(135deg,#6B7280,#374151)', ageRange:'18-40 anos', datetime:_fd(1,7),     duration:'1h',    local:'SmartFit Faria Lima',          address:'Av. Brig. Faria Lima, 2232',           region:'Itaim Bibi',  period:'manhã', createdBy:'João',     creatorInitial:'J', creatorColor:'av-blue',   description:'Treino de funcional em grupo. Iniciantes bem-vindos!',                                 maxParticipants:15, participants:[{i:'J',c:'av-blue',name:'João'},{i:'T',c:'av-orange',name:'Tiago'}], isOpen:true },
  { id:'fd-27', title:'WOD CrossFit Brooklin',       sport:'🏋️',sportSlug:'crossfit',  gradient:'linear-gradient(135deg,#F97316,#C2410C)', ageRange:'20-40 anos', datetime:_fd(2,6,30),  duration:'1h',    local:'Bodytech Itaim',               address:'Rua Funchal, 418',                     region:'Itaim Bibi',  period:'manhã', createdBy:'Pedro',    creatorInitial:'P', creatorColor:'av-orange', description:'WOD de alta intensidade. Escalar conforme o nível.',                                    maxParticipants:12, participants:[{i:'P',c:'av-orange',name:'Pedro'}], isOpen:true },
  { id:'fd-28', title:'Jiu-jitsu Aberto Lapa',       sport:'🥋', sportSlug:'jiujitsu',  gradient:'linear-gradient(135deg,#374151,#111827)', ageRange:'16-40 anos', datetime:_fd(3,19),    duration:'1h30',  local:'FIEC Esportes',                address:'Rua Tagipuru, 235',                    region:'Barra Funda', period:'noite', createdBy:'Lucas',    creatorInitial:'L', creatorColor:'av-green',  description:'Treino aberto de Jiu-jitsu. Faixas branca a roxa.',                                    maxParticipants:20, participants:[{i:'L',c:'av-green',name:'Lucas'},{i:'G',c:'av-teal',name:'Gustavo'}], isOpen:true },
  { id:'fd-29', title:'Boxe Recreativo Bela Vista',  sport:'🥊', sportSlug:'boxe',      gradient:'linear-gradient(135deg,#DC2626,#991B1B)', ageRange:'18-40 anos', datetime:_fd(4,7),     duration:'1h',    local:'Arena Brasil Futebol',         address:'Rua Sílvia, 254',                      region:'Bela Vista',  period:'manhã', createdBy:'Marcos',   creatorInitial:'M', creatorColor:'av-green',  description:'Treino de boxe estilo recreativo. Equipamentos disponíveis.',                           maxParticipants:10, participants:[{i:'M',c:'av-green',name:'Marcos'}], isOpen:true },
  { id:'fd-30', title:'Forró Universitário',         sport:'💃', sportSlug:'dança',     gradient:'linear-gradient(135deg,#EC4899,#BE185D)', ageRange:'18-35 anos', datetime:_fd(5,20,30), duration:'2h',    local:'SESC Pinheiros',               address:'Rua Paes Leme, 195',                   region:'Pinheiros',   period:'noite', createdBy:'Juliana',  creatorInitial:'J', creatorColor:'av-pink',   description:'Aula aberta de forró universitário. Iniciantes super bem-vindos!',                     maxParticipants:30, participants:[{i:'J',c:'av-pink',name:'Juliana'},{i:'L',c:'av-orange',name:'Lucas'}], isOpen:true },
  { id:'fd-31', title:'Ping-pong Centro Cultural',   sport:'🏓', sportSlug:'pingpong',  gradient:'linear-gradient(135deg,#F97316,#C2410C)', ageRange:'Todos',      datetime:_fd(2,14),    duration:'2h',    local:'Centro Cultural SP',           address:'Rua Vergueiro, 1000',                  region:'Paraíso',     period:'tarde', createdBy:'Eduardo',  creatorInitial:'E', creatorColor:'av-orange', description:'Torneio amistoso de ping-pong. Mesas disponíveis no local.',                            maxParticipants:16, participants:[{i:'E',c:'av-orange',name:'Eduardo'},{i:'S',c:'av-blue',name:'Sofia'}], isOpen:true },
  { id:'fd-32', title:'Badminton Clube Lapa',        sport:'🏸', sportSlug:'badminton', gradient:'linear-gradient(135deg,#22C55E,#059669)', ageRange:'18-40 anos', datetime:_fd(1,19),    duration:'1h30',  local:'Clube Lapa',                   address:'Rua Ministro Godoi, 1000',             region:'Lapa',        period:'noite', createdBy:'Nathalia', creatorInitial:'N', creatorColor:'av-pink',   description:'Jogo de badminton recreativo. Raquetes emprestadas.',                                  maxParticipants:8,  participants:[{i:'N',c:'av-pink',name:'Nathalia'}], isOpen:true },
  { id:'fd-33', title:'Pelada Livre Aclimação',      sport:'⚽', sportSlug:'futebol',   gradient:'linear-gradient(135deg,#22C55E,#15803D)', ageRange:'Todos',      datetime:_fd(7,9,30),  duration:'1h30',  local:'Parque da Aclimação',          address:'Rua Muniz de Souza, 1119',             region:'Aclimação',   period:'manhã', createdBy:'Wellington',creatorInitial:'W', creatorColor:'av-green',  description:'Pelada aberta no parque. Sem nível mínimo. É só chegar!',                              maxParticipants:22, participants:[{i:'W',c:'av-green',name:'Wellington'}], isOpen:true },
  { id:'fd-34', title:'Escalada Jaraguá',            sport:'🧗', sportSlug:'escalada',  gradient:'linear-gradient(135deg,#6B7280,#374151)', ageRange:'20-40 anos', datetime:_fd(13,8),    duration:'5h',    local:'Pico do Jaraguá',              address:'Estrada do Jaraguá, km 5',             region:'Jaraguá',     period:'manhã', createdBy:'Thiago',   creatorInitial:'T', creatorColor:'av-purple', description:'Escalada outdoor para intermediários. Equipamentos próprios.',                          maxParticipants:8,  participants:[{i:'T',c:'av-purple',name:'Thiago'}], isOpen:true },
  { id:'fd-35', title:'Rugby Touch Ibirapuera',      sport:'🏉', sportSlug:'rugby',     gradient:'linear-gradient(135deg,#22C55E,#166534)', ageRange:'18-35 anos', datetime:_fd(6,9),     duration:'2h',    local:'Parque Ibirapuera',            address:'Portão 7B, Parque Ibirapuera',         region:'Moema',       period:'manhã', createdBy:'Felipe',   creatorInitial:'F', creatorColor:'av-blue',   description:'Touch rugby sem contato físico. Iniciantes super bem-vindos!',                         maxParticipants:20, participants:[{i:'F',c:'av-blue',name:'Felipe'},{i:'M',c:'av-orange',name:'Marcos'}], isOpen:true },
  { id:'fd-36', title:'Corrida Noturna Ibirapuera',  sport:'🏃', sportSlug:'corrida',   gradient:'linear-gradient(135deg,#3B82F6,#1D4ED8)', ageRange:'Todos',      datetime:_fd(1,21),    duration:'45min', local:'Parque Ibirapuera',            address:'Portão 5, Parque Ibirapuera',          region:'Moema',       period:'noite', createdBy:'Carla',    creatorInitial:'C', creatorColor:'av-pink',   description:'Corrida noturna iluminada. Ritmo livre, 4km.',                                         maxParticipants:30, participants:[{i:'C',c:'av-pink',name:'Carla'}], isOpen:true },
  { id:'fd-37', title:'Handebol SESC Vila Mariana',  sport:'🤾', sportSlug:'handebol',  gradient:'linear-gradient(135deg,#DC2626,#991B1B)', ageRange:'18-35 anos', datetime:_fd(8,14),    duration:'1h30',  local:'SESC Vila Mariana',            address:'Rua Pelotas, 141',                     region:'Vila Mariana',period:'tarde', createdBy:'Bruna',    creatorInitial:'B', creatorColor:'av-red',    description:'Racha de handebol aberto. Sem experiência necessária!',                                maxParticipants:14, participants:[{i:'B',c:'av-red',name:'Bruna'},{i:'A',c:'av-blue',name:'Alexandre'}], isOpen:true },
  { id:'fd-38', title:'Golf para Iniciantes',        sport:'⛳', sportSlug:'golf',      gradient:'linear-gradient(135deg,#22C55E,#15803D)', ageRange:'25-55 anos', datetime:_fd(10,8),    duration:'3h',    local:'Hípica Paulista',              address:'Av. João Filgueiras Lima, 210',         region:'Butantã',     period:'manhã', createdBy:'Roberto',  creatorInitial:'R', creatorColor:'av-teal',   description:'Clinic de golfe para iniciantes. Tacos emprestados!',                                  maxParticipants:6,  participants:[{i:'R',c:'av-teal',name:'Roberto'}], isOpen:true },
  { id:'fd-39', title:'Skate Livre Ibirapuera',      sport:'🛹', sportSlug:'skate',     gradient:'linear-gradient(135deg,#8B5CF6,#6D28D9)', ageRange:'14-30 anos', datetime:_fd(2,16),    duration:'2h',    local:'Parque Ibirapuera',            address:'Pista de Skate, Portão 7',             region:'Moema',       period:'tarde', createdBy:'Victor',   creatorInitial:'V', creatorColor:'av-purple', description:'Skate recreativo na pista do Ibira. Todos os níveis.',                                 maxParticipants:20, participants:[{i:'V',c:'av-purple',name:'Victor'},{i:'L',c:'av-green',name:'Leo'}], isOpen:true },
  { id:'fd-40', title:'Roda de Capoeira CEPEUSP',    sport:'🥋', sportSlug:'capoeira',  gradient:'linear-gradient(135deg,#F59E0B,#B45309)', ageRange:'Todos',      datetime:_fd(11,10,30),duration:'2h',    local:'CEPEUSP',                      address:'Rua do Anfiteatro, 181',               region:'Butantã',     period:'manhã', createdBy:'Luiz',     creatorInitial:'L', creatorColor:'av-orange', description:'Roda de capoeira angola e regional. Todos os níveis.',                                 maxParticipants:25, participants:[{i:'L',c:'av-orange',name:'Luiz'},{i:'P',c:'av-green',name:'Paulo'}], isOpen:true },
];

const SEARCH_POOL = [
  { id:'sr-1', title:'Futebol com o Bruno',   sport:'⚽', sportSlug:'futebol',  gradient:'linear-gradient(135deg,#22C55E,#15803D)', ageRange:'20-30 anos', datetime:_fd(1,19),    duration:'1h',    local:'Quadra Coberta Brooklin',  address:'Rua Barão do Trinfo, 121',       region:'Brooklin', period:'noite', createdBy:'Bruno',   creatorInitial:'B', creatorColor:'av-purple', description:'Jogo casual de futsal. Levar chuteira e calção.',               maxParticipants:20, participants:[{i:'B',c:'av-purple',name:'Bruno'},{i:'A',c:'av-pink',name:'Alice'},{i:'P',c:'av-orange',name:'Pedro'},{i:'J',c:'av-teal',name:'Joao'},{i:'M',c:'av-blue',name:'Marina'}], isOpen:true },
  { id:'sr-2', title:'Corrida Matinal',        sport:'🏃', sportSlug:'corrida',  gradient:'linear-gradient(135deg,#22C55E,#15803D)', ageRange:'20-35 anos', datetime:_fd(2,6,30),  duration:'1h',    local:'Parque Ibirapuera',        address:'Portão 5, Parque Ibirapuera',    region:'Moema',    period:'manhã', createdBy:'Maria',   creatorInitial:'M', creatorColor:'av-purple', description:'Corrida leve de 5 km ao redor do parque. Ritmo 6:30/km.',     maxParticipants:15, participants:[{i:'M',c:'av-purple',name:'Maria'},{i:'C',c:'av-teal',name:'Carlos'}], isOpen:true },
  { id:'sr-3', title:'Basquete Tarde',         sport:'🏀', sportSlug:'basquete', gradient:'linear-gradient(135deg,#8B5CF6,#6D28D9)', ageRange:'18-30 anos', datetime:_fd(4,16),    duration:'2h',    local:'Quadra Moema',             address:'Av. Moaci, 300',                 region:'Moema',    period:'tarde', createdBy:'Carlos',  creatorInitial:'C', creatorColor:'av-blue',   description:'Racha de basquete, galera boa e animada.',                    maxParticipants:10, participants:[{i:'C',c:'av-blue',name:'Carlos'},{i:'G',c:'av-green',name:'Gabriel'}], isOpen:true },
  { id:'sr-4', title:'Tênis Iniciante',        sport:'🎾', sportSlug:'tênis',    gradient:'linear-gradient(135deg,#F97316,#C2410C)', ageRange:'20-40 anos', datetime:_fd(3,8),     duration:'1h30',  local:'Clube Lapa',               address:'Rua Ministro Godoi, 1000',       region:'Lapa',     period:'manhã', createdBy:'Ana',     creatorInitial:'A', creatorColor:'av-pink',   description:'Aula aberta para iniciantes no tênis. Raquetes disponíveis.', maxParticipants:6,  participants:[{i:'A',c:'av-pink',name:'Alice'}], isOpen:true },
  { id:'sr-5', title:'Futebol Itaim',          sport:'⚽', sportSlug:'futebol',  gradient:'linear-gradient(135deg,#22C55E,#166534)', ageRange:'25-35 anos', datetime:_fd(5,7),     duration:'1h30',  local:'Clube Itaim',              address:'R. Joaquim Floriano, 400',       region:'Itaim Bibi',period:'manhã', createdBy:'Diego',   creatorInitial:'D', creatorColor:'av-teal',   description:'Pelada semanal. Vaga aberta para goleiros. Times de 11.',     maxParticipants:22, participants:[{i:'D',c:'av-teal',name:'Diego'},{i:'R',c:'av-purple',name:'Rafael'},{i:'L',c:'av-green',name:'Lucas'}], isOpen:true },
  { id:'sr-6', title:'Corrida Noturna',         sport:'🏃', sportSlug:'corrida',  gradient:'linear-gradient(135deg,#3B82F6,#1D4ED8)', ageRange:'18-40 anos', datetime:_fd(3,21),    duration:'45min', local:'Parque do Povo',           address:'Av. Brig. Faria Lima, s/n',      region:'Itaim Bibi',period:'noite', createdBy:'Ricardo', creatorInitial:'R', creatorColor:'av-blue',   description:'Corrida noturna às luzes da cidade. 3 km, ritmo livre.',      maxParticipants:30, participants:[{i:'R',c:'av-blue',name:'Rodrigo'}], isOpen:true },
  { id:'sr-7', title:'Futebol Lapa',           sport:'⚽', sportSlug:'futebol',  gradient:'linear-gradient(135deg,#22C55E,#15803D)', ageRange:'18-30 anos', datetime:_fd(2,20),    duration:'1h',    local:'Campo Society Lapa',       address:'Rua Cerro Corá, 900',            region:'Lapa',     period:'noite', createdBy:'Paulo',   creatorInitial:'P', creatorColor:'av-orange', description:'Jogo de futebol society aberto. 7×7. Traga chuteira.',       maxParticipants:14, participants:[{i:'P',c:'av-orange',name:'Pedro'},{i:'G',c:'av-green',name:'Gabriel'}], isOpen:true },
  { id:'sr-8', title:'Basquete Moema',         sport:'🏀', sportSlug:'basquete', gradient:'linear-gradient(135deg,#8B5CF6,#6D28D9)', ageRange:'20-35 anos', datetime:_fd(3,17),    duration:'1h30',  local:'Quadra Moema Park',        address:'Av. Moaci, 1000',                region:'Moema',    period:'tarde', createdBy:'Fernanda',creatorInitial:'F', creatorColor:'av-pink',   description:'Pelada de basquete no Moema Park. 5×5.',                      maxParticipants:10, participants:[{i:'F',c:'av-pink',name:'Fernanda'},{i:'M',c:'av-blue',name:'Marina'}], isOpen:true },
];

function _allPools() { return [...FEED_POOL, ...SEARCH_POOL, ...Object.values(FRIEND_EVENTS).flat()]; }

/* ── estado padrão ─────────────────────────────────────────── */
const STORE_KEY = 'sm_store_v7';
const VERSION   = 7;

function _defaultState() {
  return {
    version: VERSION,
    user: {
      name:        'Luiz Fernando',
      username:    'luizfernando',
      bio:         'Apaixonado por esportes e vida ao ar livre 🏃‍♂️',
      location:    'Brooklin, São Paulo',
      bairro:      'Brooklin',
      sports:      ['corrida','futebol','basquete'],
      preferences: { activities: ['Futebol','Corrida','Basquete'], bairro: 'Brooklin' },
      initials:    'LF',
      colorClass:  'av-orange',
    },
    myEvents: [
      {
        id:'ev-basquete', title:'Basquete no Brooklin', sport:'🏀', sportSlug:'basquete',
        gradient:'linear-gradient(135deg,#F97316,#C2410C)',
        ageRange:'18-35 anos', datetime:_fd(3,18), duration:'1h30',
        local:'Quadra Brooklin', address:'Av. Morumbi, 123, Brooklin',
        region:'Brooklin',
        createdBy:'João', creatorInitial:'J', creatorColor:'av-blue',
        participants:[{i:'LF',c:'av-orange',name:'Luiz Fernando'},{i:'J',c:'av-blue',name:'Joao'},{i:'R',c:'av-purple',name:'Rafael'},{i:'G',c:'av-green',name:'Gabriel'}],
        maxParticipants:12, isOpen:true,
        description:'Jogo amistoso 3×3. Todos os níveis são bem-vindos. Leve água e tênis.',
        status:'active', source:'joined',
      },
      {
        id:'ev-criado-1', title:'Corrida Matinal Brooklin', sport:'🏃', sportSlug:'corrida',
        gradient:'linear-gradient(135deg,#22C55E,#059669)',
        ageRange:'Todos', datetime:_fd(6,7), duration:'1h',
        local:'Parque do Povo', address:'Av. Brigadeiro Faria Lima, s/n',
        region:'Itaim Bibi',
        createdBy:'Luiz Fernando', creatorInitial:'LF', creatorColor:'av-orange',
        participants:[{i:'LF',c:'av-orange',name:'Luiz Fernando'},{i:'B',c:'av-purple',name:'Bruno'},{i:'A',c:'av-pink',name:'Alice'}],
        maxParticipants:15, isOpen:true,
        description:'Corrida leve de 5km pela manhã. Todos os ritmos bem-vindos!',
        status:'active', source:'created',
      },
      {
        id:'ev-criado-2', title:'Futebol Society Brooklin', sport:'⚽', sportSlug:'futebol',
        gradient:'linear-gradient(135deg,#22C55E,#15803D)',
        ageRange:'20-35 anos', datetime:_fd(12,19), duration:'1h30',
        local:'Arena Society Brooklin', address:'Rua Álvaro Cruz, 300',
        region:'Brooklin',
        createdBy:'Luiz Fernando', creatorInitial:'LF', creatorColor:'av-orange',
        participants:[{i:'LF',c:'av-orange',name:'Luiz Fernando'},{i:'L',c:'av-green',name:'Lucas'},{i:'C',c:'av-teal',name:'Carlos'}],
        maxParticipants:14, isOpen:true,
        description:'Pelada society semanal. Times de 7. Chuteira obrigatória.',
        status:'active', source:'created',
      },
    ],
    feedIndex:        0,
    feedSeenIds:      [],
    rejectedSlugs:    {},
    sportHistory:     {},
    notifications: [
      { id:'nt-1', type:'invite', from:'João',   fromInitial:'J', fromColor:'av-blue',   sport:'🎾 Tênis',   label:'Tênis',   datetime:_fd(1,19,30), local:'Clube Pinheiros',    status:'pending', eventId:'fd-2' },
      { id:'nt-2', type:'invite', from:'Maria',  fromInitial:'M', fromColor:'av-purple', sport:'🧘 Yoga',    label:'Yoga',    datetime:_fd(2,7,30),  local:'Parque Villa-Lobos', status:'pending', eventId:'fd-7' },
      { id:'nt-3', type:'invite', from:'Carlos', fromInitial:'C', fromColor:'av-teal',   sport:'🏃 Corrida', label:'Corrida', datetime:_fd(2,6,30),  local:'Av. Paulista',       status:'pending', eventId:'sr-2' },
      { id:'nt-4', type:'friend', from:'Pedro',  fromInitial:'P', fromColor:'av-orange', sport:'Corrida · Futebol',  status:'pending' },
      { id:'nt-5', type:'friend', from:'Lucas',  fromInitial:'L', fromColor:'av-green',  sport:'Futebol · Basquete', status:'pending' },
    ],
    friends: [
      {id:'fr-1', name:'Bruno',  initial:'B', color:'av-purple', sports:['futebol','corrida'],  bio:'Pelada toda semana! ⚽🔥',      location:'Lapa, São Paulo',         stats:{participated:18, created:3, friends:24}},
      {id:'fr-2', name:'Alice',  initial:'A', color:'av-pink',   sports:['corrida'],             bio:'Maratonista amadora 🏃‍♀️',      location:'Vila Olímpia, SP',        stats:{participated:25, created:5, friends:31}},
      {id:'fr-3', name:'Carlos', initial:'C', color:'av-teal',   sports:['corrida','ciclismo'],  bio:'Pedaleiro de fim de semana 🚴', location:'Pinheiros, SP',           stats:{participated:12, created:2, friends:18}},
      {id:'fr-4', name:'Camila', initial:'C', color:'av-orange', sports:['yoga','corrida'],      bio:'Yoga e bem-estar 🧘',           location:'Jardins, SP',             stats:{participated:20, created:4, friends:42}},
      {id:'fr-5', name:'Lucas',  initial:'L', color:'av-green',  sports:['futebol'],             bio:'Futebol é vida ⚽',             location:'Brooklin, SP',            stats:{participated:30, created:8, friends:35}},
      {id:'fr-6', name:'Marina', initial:'M', color:'av-blue',   sports:['corrida','natação'],   bio:'Nadar é voar 🏊',              location:'Moema, SP',               stats:{participated:15, created:2, friends:27}},
    ],
  };
}

/* ── scoring de recomendação ──────────────────────────────── */
function _scoreEvent(ev, user, state) {
  let score = 0;
  const prefs   = (user.preferences?.activities || user.sports || []).map(a => a.toLowerCase());
  const slug    = (ev.sportSlug || '').toLowerCase();
  const friends = state.friends || [];
  const history = state.sportHistory || {};

  // Sinal 1: esporte preferido do perfil (peso alto)
  if (prefs.some(p => slug.includes(p) || p.includes(slug))) score += 40;

  // Sinal 2: esporte que o usuário já praticou
  if (history[slug]) score += Math.min(history[slug] * 10, 30);

  // Sinal 3: amigo criou o evento
  const creatorFriend = friends.find(f =>
    f.name.toLowerCase() === (ev.createdBy || '').toLowerCase()
  );
  if (creatorFriend) score += 35;

  // Sinal 4: amigo está participando
  const participantNames = (ev.participants || []).map(p => (p.name || '').toLowerCase());
  const friendsIn = friends.filter(f => participantNames.includes(f.name.toLowerCase()));
  score += friendsIn.length * 15;

  // Sinal 5: mesma região do usuário
  const userBairro = (user.bairro || user.preferences?.bairro || '').toLowerCase();
  if (userBairro && (ev.region || '').toLowerCase().includes(userBairro)) score += 20;

  // Sinal 6: vagas disponíveis
  const spots = (ev.maxParticipants || 20) - (ev.participants?.length || 0);
  if (spots > 5)             score += 5;
  if (spots > 0 && spots <= 2) score -= 10;
  if (spots <= 0)            score -= 50;

  // Sinal 7: evento próximo (próximos 3 dias = boost)
  const daysUntil = (new Date(ev.datetime) - new Date()) / 86400000;
  if (daysUntil >= 0 && daysUntil <= 3) score += 15;
  else if (daysUntil > 14)              score -= 5;

  // Sinal 8: popularidade (taxa de ocupação)
  const fillRate = (ev.participants?.length || 0) / (ev.maxParticipants || 20);
  if (fillRate > 0.5) score += 10;

  // Sinal 9: penalizar esporte rejeitado repetidamente
  const rejections = (state.rejectedSlugs || {})[slug] || 0;
  score -= rejections * 8;

  return score;
}

function _getRecommendationReason(ev, user, state) {
  const prefs   = (user.preferences?.activities || user.sports || []).map(a => a.toLowerCase());
  const slug    = (ev.sportSlug || '').toLowerCase();
  const friends = state.friends || [];

  const creatorFriend = friends.find(f =>
    f.name.toLowerCase() === (ev.createdBy || '').toLowerCase()
  );
  if (creatorFriend) return '👥 ' + creatorFriend.name.split(' ')[0] + ' organiza';

  const participantNames = (ev.participants || []).map(p => (p.name || '').toLowerCase());
  const fp = friends.filter(f => participantNames.includes(f.name.toLowerCase()));
  if (fp.length === 1) return '👥 ' + fp[0].name.split(' ')[0] + ' vai participar';
  if (fp.length > 1)   return '👥 ' + fp.length + ' amigos vão participar';

  const history = state.sportHistory || {};
  if (history[slug] >= 2) return '🔁 Você jogou ' + ev.sport + ' ' + history[slug] + 'x';

  if (prefs.some(p => slug.includes(p) || p.includes(slug))) return '⭐ Combinado com seu perfil';

  const userBairro = (user.bairro || user.preferences?.bairro || '').toLowerCase();
  if (userBairro && (ev.region || '').toLowerCase().includes(userBairro)) return '📍 Perto de você';

  const daysUntil = (new Date(ev.datetime) - new Date()) / 86400000;
  if (daysUntil >= 0 && daysUntil <= 2) return '⚡ Acontece em breve!';

  return null;
}

/* ── Store ──────────────────────────────────────────────────── */
const Store = {
  _s: null,
  _memoryOnly: false,
  _isNewUser: false,

  load() {
    try {
      const raw    = localStorage.getItem(STORE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && parsed.version === VERSION) {
        this._s = parsed;
        this._isNewUser = false;
      } else {
        this._s = _defaultState();
        this._isNewUser = !raw;
      }
    } catch(_) { this._s = _defaultState(); this._isNewUser = true; }
    this._save();
    return this;
  },

  _save() {
    if (this._memoryOnly) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this._s)); }
    catch(err) { this._memoryOnly = true; console.warn('[SportMeet] localStorage indisponível — operando apenas em memória.', err); }
  },

  reset() { this._s = _defaultState(); this._save(); },

  /* ── user ── */
  getUser()        { return this._s.user; },
  updateUser(upd)  { Object.assign(this._s.user, upd); this._save(); },

  /* ── computed stats (always reflects real data) ── */
  getStats() {
    return {
      participated: this.getMyEvents().length,
      created:      this.getMyCreated().length,
      friends:      this._s.friends.length,
    };
  },

  /* ── events ── */
  getMyEvents()  { return this._s.myEvents.filter(e => e.status === 'active'); },
  getMyCreated() { return this.getMyEvents().filter(e => e.source === 'created'); },
  isMyEvent(id)  { return this._s.myEvents.some(e => e.id === id && e.status === 'active'); },

  getEventById(id) {
    return this._s.myEvents.find(e => e.id === id)
        || _allPools().find(e => e.id === id)
        || null;
  },

  joinEvent(ev) {
    const existing = this._s.myEvents.find(e => e.id === ev.id);
    if (existing) { existing.status = 'active'; }
    else { this._s.myEvents.push({ ...structuredClone(ev), status:'active', source: ev.source || 'joined' }); }
    this._save();
  },

  cancelEvent(id) {
    const ev = this._s.myEvents.find(e => e.id === id);
    if (!ev) return null;
    const snap = { ...ev };
    ev.status = 'cancelled';
    this._save();
    return snap;
  },

  createEvent(data) {
    const SPORT_MAP = {
      futebol:    {emoji:'⚽', gradient:'linear-gradient(135deg,#22C55E,#15803D)'},
      corrida:    {emoji:'🏃', gradient:'linear-gradient(135deg,#22C55E,#059669)'},
      basquete:   {emoji:'🏀', gradient:'linear-gradient(135deg,#8B5CF6,#6D28D9)'},
      tênis:      {emoji:'🎾', gradient:'linear-gradient(135deg,#F97316,#C2410C)'},
      natação:    {emoji:'🏊', gradient:'linear-gradient(135deg,#06B6D4,#0E7490)'},
      vôlei:      {emoji:'🏐', gradient:'linear-gradient(135deg,#EAB308,#B45309)'},
      ciclismo:   {emoji:'🚴', gradient:'linear-gradient(135deg,#3B82F6,#1D4ED8)'},
      yoga:       {emoji:'🧘', gradient:'linear-gradient(135deg,#EC4899,#BE185D)'},
      escalada:   {emoji:'🧗', gradient:'linear-gradient(135deg,#6B7280,#374151)'},
      outro:      {emoji:'🏅', gradient:'linear-gradient(135deg,#6B7280,#374151)'},
    };
    const slug  = (data.sportSlug || '').toLowerCase().trim();
    const match = Object.entries(SPORT_MAP).find(([k]) => slug.includes(k));
    const { emoji, gradient } = match ? match[1] : SPORT_MAP.outro;
    const u = this._s.user;
    const ev = {
      id:             'ev-' + uid(),
      title:          data.ativ,
      sport:          data.sportEmoji || emoji,
      sportSlug:      slug,
      gradient:       data.gradient   || gradient,
      ageRange:       data.faixa      || 'Livre',
      datetime:       data.isoDatetime || new Date().toISOString().slice(0,16),
      duration:       data.duracao    || '1h',
      local:          data.local,
      address:        data.localAddress || data.local,
      region:         data.region     || '',
      createdBy:      u.name,
      creatorInitial: u.initials,
      creatorColor:   u.colorClass,
      participants:   [{ i: u.initials, c: u.colorClass, name: u.name }],
      maxParticipants:parseInt(data.maxPart) || 20,
      isOpen:         data.aberto !== false,
      description:    data.desc || '',
      status:         'active',
      source:         'created',
    };
    this._s.myEvents.push(ev);
    // Update sport history
    if (!this._s.sportHistory) this._s.sportHistory = {};
    this._s.sportHistory[slug] = (this._s.sportHistory[slug] || 0) + 1;
    this._save();
    return ev;
  },

  /* ── feed com sistema de recomendação ── */
  getRecommendedFeed(sportFilter) {
    const all  = _allPools();
    const user = this._s.user;
    const seen = new Set(this._s.feedSeenIds || []);
    const now  = new Date();

    let candidates = all.filter(ev => {
      if (seen.has(ev.id))         return false;
      if (this.isMyEvent(ev.id))   return false;
      if (new Date(ev.datetime) <= now) return false;
      const spots = (ev.maxParticipants || 20) - (ev.participants?.length || 0);
      if (spots <= 0)              return false;
      if (sportFilter) {
        const s = (ev.sportSlug || '').toLowerCase();
        return s.includes(sportFilter.toLowerCase()) ||
               (ev.sport || '').toLowerCase().includes(sportFilter.toLowerCase());
      }
      return true;
    });

    const scored = candidates.map(ev => ({
      ev,
      score:  _scoreEvent(ev, user, this._s),
      reason: _getRecommendationReason(ev, user, this._s),
    }));

    scored.sort((a, b) => {
      const bA = Math.floor(a.score / 10);
      const bB = Math.floor(b.score / 10);
      if (bA !== bB) return bB - bA;
      return Math.random() - 0.5; // small shuffle within same bucket
    });

    return scored.map(s => ({ ...s.ev, _reason: s.reason }));
  },

  // Legacy – kept for compat but now uses recommendation engine
  getFeedStack(sportFilter) { return this.getRecommendedFeed(sportFilter).slice(0, 3); },

  getNewCount() {
    return this.getRecommendedFeed().length;
  },

  markSeen(id) {
    if (!this._s.feedSeenIds) this._s.feedSeenIds = [];
    if (!this._s.feedSeenIds.includes(id)) {
      this._s.feedSeenIds.push(id);
      this._save();
    }
  },

  markAccepted(ev) {
    if (!ev) return;
    const slug = ev.sportSlug || 'outro';
    if (!this._s.sportHistory) this._s.sportHistory = {};
    this._s.sportHistory[slug] = (this._s.sportHistory[slug] || 0) + 1;
    this.markSeen(ev.id);
    if (!this.isMyEvent(ev.id)) this.joinEvent({ ...ev, source:'feed' });
  },

  markRejected(ev) {
    if (!ev) return;
    const slug = ev.sportSlug || 'outro';
    if (!this._s.rejectedSlugs) this._s.rejectedSlugs = {};
    this._s.rejectedSlugs[slug] = (this._s.rejectedSlugs[slug] || 0) + 1;
    this.markSeen(ev.id);
  },

  clearFeedHistory() {
    this._s.feedSeenIds   = [];
    this._s.rejectedSlugs = {};
    this._save();
  },

  // Legacy accept/reject (feed index-based) — deprecated but kept for safety
  getCurrentFeedCard() { return this.getRecommendedFeed()[0] || null; },
  acceptCurrentFeed() {
    const card = this.getCurrentFeedCard();
    if (!card) return null;
    this.markAccepted(card);
    return card;
  },
  rejectCurrentFeed() {
    const card = this.getCurrentFeedCard();
    if (card) this.markRejected(card);
  },

  /* ── busca ── */
  search(query, filters) {
    const all = [...SEARCH_POOL, ...FEED_POOL];
    const q   = (query || '').toLowerCase().trim();
    const fls = (filters || []).map(f => f.toLowerCase());
    if (!q && fls.length === 0) return all;
    return all.filter(ev => {
      const hay = [ev.title, ev.sportSlug, ev.local, ev.address, ev.region,
                   ev.period, ev.ageRange, ev.createdBy, ev.description || ''].join(' ').toLowerCase();
      const okQ = !q || hay.includes(q);
      const okF = fls.length === 0 || fls.some(f => hay.includes(f));
      return okQ && okF;
    });
  },

  /* ── notificações ── */
  getNotifications() { return this._s.notifications.filter(n => n.status === 'pending'); },
  dismissNotif(id)   { const n=this._s.notifications.find(n=>n.id===id); if(n){n.status='dismissed';this._save();} },
  acceptNotif(id) {
    const n = this._s.notifications.find(n => n.id === id);
    if (!n) return;
    n.status = 'accepted';
    if (n.type === 'invite' && n.eventId) {
      const ev = this.getEventById(n.eventId);
      if (ev && !this.isMyEvent(n.eventId)) {
        this.joinEvent({ ...ev, source:'invited' });
        // Update sport history for accepted invites
        const slug = ev.sportSlug || 'outro';
        if (!this._s.sportHistory) this._s.sportHistory = {};
        this._s.sportHistory[slug] = (this._s.sportHistory[slug] || 0) + 1;
      }
    } else if (n.type === 'friend') {
      // Add friend to array if not already there
      const alreadyFriend = this._s.friends.some(f =>
        f.name.toLowerCase() === (n.from || '').toLowerCase()
      );
      if (!alreadyFriend) {
        this._s.friends.push({
          id:       'fr-' + uid(),
          name:     n.from,
          initial:  n.fromInitial,
          color:    n.fromColor,
          sports:   (n.sport || '').split(' · ').map(s => s.toLowerCase().trim()).filter(Boolean),
          bio:      '',
          location: 'São Paulo',
          stats:    { participated: 0, created: 0, friends: 0 },
        });
      }
    }
    this._save();
  },

  /* ── amigos ── */
  getFriends()        { return this._s.friends; },
  getFriendById(id)   { return this._s.friends.find(f => f.id === id) || null; },
  getFriendEvents(id) { return FRIEND_EVENTS[id] || []; },
  removeFriend(id)    {
    this._s.friends = this._s.friends.filter(f => f.id !== id);
    this._save();
  },
  getLocations()         { return SP_LOCATIONS; },
  getActivities()        { return SP_ACTIVITIES; },
  getBairros()           { return SP_BAIRROS; },
  updatePreferences(upd) {
    if (!this._s.user.preferences) this._s.user.preferences = { activities:[], bairro:'' };
    Object.assign(this._s.user.preferences, upd);
    this._save();
  },

  /* ── estado temporário entre páginas ── */
  setPending(k, v) { this._s['_p_'+k] = v; this._save(); },
  getPending(k)    { return this._s['_p_'+k]; },
  clearPending(k)  { delete this._s['_p_'+k]; this._save(); },

  /* ── formatadores ── */
  fmt: { dow:dtDow, day:dtDay, time:dtTime, short:dtShort, full:dtFull, month:dtMonth, date:dtDate },
};
