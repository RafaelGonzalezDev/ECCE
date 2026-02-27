// Honduras — Departamentos y Municipios
// Fuente: División político-administrativa oficial de Honduras

export interface Municipio {
    id: string;
    nombre: string;
}

export interface Departamento {
    id: string;
    nombre: string;
    municipios: Municipio[];
}

export const HONDURAS_DEPARTAMENTOS: Departamento[] = [
    {
        id: 'AT', nombre: 'Atlántida',
        municipios: [
            { id: 'AT-01', nombre: 'La Ceiba' }, { id: 'AT-02', nombre: 'El Porvenir' },
            { id: 'AT-03', nombre: 'Esparta' }, { id: 'AT-04', nombre: 'Jutiapa' },
            { id: 'AT-05', nombre: 'La Masica' }, { id: 'AT-06', nombre: 'San Francisco' },
            { id: 'AT-07', nombre: 'Tela' }, { id: 'AT-08', nombre: 'Arizona' },
        ]
    },
    {
        id: 'CH', nombre: 'Choluteca',
        municipios: [
            { id: 'CH-01', nombre: 'Choluteca' }, { id: 'CH-02', nombre: 'Apacilagua' },
            { id: 'CH-03', nombre: 'Concepción de María' }, { id: 'CH-04', nombre: 'Duyure' },
            { id: 'CH-05', nombre: 'El Corpus' }, { id: 'CH-06', nombre: 'El Triunfo' },
            { id: 'CH-07', nombre: 'Marcovia' }, { id: 'CH-08', nombre: 'Morolica' },
            { id: 'CH-09', nombre: 'Namasigüe' }, { id: 'CH-10', nombre: 'Orocuina' },
            { id: 'CH-11', nombre: 'Pespire' }, { id: 'CH-12', nombre: 'San Antonio de Flores' },
            { id: 'CH-13', nombre: 'San Isidro' }, { id: 'CH-14', nombre: 'San José' },
            { id: 'CH-15', nombre: 'San Marcos de Colón' }, { id: 'CH-16', nombre: 'Santa Ana de Yusguare' },
        ]
    },
    {
        id: 'CL', nombre: 'Colón',
        municipios: [
            { id: 'CL-01', nombre: 'Trujillo' }, { id: 'CL-02', nombre: 'Balfate' },
            { id: 'CL-03', nombre: 'Iriona' }, { id: 'CL-04', nombre: 'Limón' },
            { id: 'CL-05', nombre: 'Sabá' }, { id: 'CL-06', nombre: 'Santa Fe' },
            { id: 'CL-07', nombre: 'Santa Rosa de Aguán' }, { id: 'CL-08', nombre: 'Sonaguera' },
            { id: 'CL-09', nombre: 'Tocoa' }, { id: 'CL-10', nombre: 'Bonito Oriental' },
        ]
    },
    {
        id: 'CM', nombre: 'Comayagua',
        municipios: [
            { id: 'CM-01', nombre: 'Comayagua' }, { id: 'CM-02', nombre: 'Ajuterique' },
            { id: 'CM-03', nombre: 'El Rosario' }, { id: 'CM-04', nombre: 'Esquías' },
            { id: 'CM-05', nombre: 'Humuya' }, { id: 'CM-06', nombre: 'La Libertad' },
            { id: 'CM-07', nombre: 'Lamaní' }, { id: 'CM-08', nombre: 'La Trinidad' },
            { id: 'CM-09', nombre: 'Lejamaní' }, { id: 'CM-10', nombre: 'Meámbar' },
            { id: 'CM-11', nombre: 'Minas de Oro' }, { id: 'CM-12', nombre: 'Ojos de Agua' },
            { id: 'CM-13', nombre: 'San Jerónimo' }, { id: 'CM-14', nombre: 'San José de Comayagua' },
            { id: 'CM-15', nombre: 'San José del Potrero' }, { id: 'CM-16', nombre: 'San Luis' },
            { id: 'CM-17', nombre: 'San Sebastián' }, { id: 'CM-18', nombre: 'Siguatepeque' },
            { id: 'CM-19', nombre: 'Trinidad de Comayagua' }, { id: 'CM-20', nombre: 'Villa de San Antonio' },
            { id: 'CM-21', nombre: 'Las Lajas' }, { id: 'CM-22', nombre: 'Taulabé' },
        ]
    },
    {
        id: 'CP', nombre: 'Copán',
        municipios: [
            { id: 'CP-01', nombre: 'Santa Rosa de Copán' }, { id: 'CP-02', nombre: 'Cabañas' },
            { id: 'CP-03', nombre: 'Concepción' }, { id: 'CP-04', nombre: 'Copán Ruinas' },
            { id: 'CP-05', nombre: 'Corquín' }, { id: 'CP-06', nombre: 'Cucuyagua' },
            { id: 'CP-07', nombre: 'Dolores' }, { id: 'CP-08', nombre: 'Dulce Nombre' },
            { id: 'CP-09', nombre: 'El Paraíso' }, { id: 'CP-10', nombre: 'Florida' },
            { id: 'CP-11', nombre: 'La Jigua' }, { id: 'CP-12', nombre: 'La Unión' },
            { id: 'CP-13', nombre: 'Nueva Arcadia' }, { id: 'CP-14', nombre: 'San Agustín' },
            { id: 'CP-15', nombre: 'San Antonio' }, { id: 'CP-16', nombre: 'San Jerónimo' },
            { id: 'CP-17', nombre: 'San José' }, { id: 'CP-18', nombre: 'San Juan de Opoa' },
            { id: 'CP-19', nombre: 'San Nicolás' }, { id: 'CP-20', nombre: 'San Pedro' },
            { id: 'CP-21', nombre: 'Santa Rita' }, { id: 'CP-22', nombre: 'Trinidad de Copán' },
            { id: 'CP-23', nombre: 'Veracruz' },
        ]
    },
    {
        id: 'CR', nombre: 'Cortés',
        municipios: [
            { id: 'CR-01', nombre: 'San Pedro Sula' }, { id: 'CR-02', nombre: 'Choloma' },
            { id: 'CR-03', nombre: 'Omoa' }, { id: 'CR-04', nombre: 'Pimienta' },
            { id: 'CR-05', nombre: 'Potrerillos' }, { id: 'CR-06', nombre: 'Puerto Cortés' },
            { id: 'CR-07', nombre: 'San Antonio de Cortés' }, { id: 'CR-08', nombre: 'San Francisco de Yojoa' },
            { id: 'CR-09', nombre: 'San Manuel' }, { id: 'CR-10', nombre: 'Santa Cruz de Yojoa' },
            { id: 'CR-11', nombre: 'Villanueva' }, { id: 'CR-12', nombre: 'La Lima' },
        ]
    },
    {
        id: 'EP', nombre: 'El Paraíso',
        municipios: [
            { id: 'EP-01', nombre: 'Yuscarán' }, { id: 'EP-02', nombre: 'Alauca' },
            { id: 'EP-03', nombre: 'Danlí' }, { id: 'EP-04', nombre: 'El Paraíso' },
            { id: 'EP-05', nombre: 'Güinope' }, { id: 'EP-06', nombre: 'Jacaleapa' },
            { id: 'EP-07', nombre: 'Liure' }, { id: 'EP-08', nombre: 'Morocelí' },
            { id: 'EP-09', nombre: 'Oropolí' }, { id: 'EP-10', nombre: 'Potrerillos' },
            { id: 'EP-11', nombre: 'San Antonio de Flores' }, { id: 'EP-12', nombre: 'San Lucas' },
            { id: 'EP-13', nombre: 'San Matías' }, { id: 'EP-14', nombre: 'Soledad' },
            { id: 'EP-15', nombre: 'Teupasenti' }, { id: 'EP-16', nombre: 'Texiguat' },
            { id: 'EP-17', nombre: 'Vado Ancho' }, { id: 'EP-18', nombre: 'Yauyupe' },
            { id: 'EP-19', nombre: 'Trojes' },
        ]
    },
    {
        id: 'FM', nombre: 'Francisco Morazán',
        municipios: [
            { id: 'FM-01', nombre: 'Tegucigalpa' }, { id: 'FM-02', nombre: 'Alubaren' },
            { id: 'FM-03', nombre: 'Cedros' }, { id: 'FM-04', nombre: 'Curarén' },
            { id: 'FM-05', nombre: 'El Porvenir' }, { id: 'FM-06', nombre: 'Guaimaca' },
            { id: 'FM-07', nombre: 'La Libertad' }, { id: 'FM-08', nombre: 'La Venta' },
            { id: 'FM-09', nombre: 'Lepaterique' }, { id: 'FM-10', nombre: 'Maraita' },
            { id: 'FM-11', nombre: 'Marale' }, { id: 'FM-12', nombre: 'Nueva Armenia' },
            { id: 'FM-13', nombre: 'Ojojona' }, { id: 'FM-14', nombre: 'Orica' },
            { id: 'FM-15', nombre: 'Reitoca' }, { id: 'FM-16', nombre: 'Sabanagrande' },
            { id: 'FM-17', nombre: 'San Antonio de Oriente' }, { id: 'FM-18', nombre: 'San Buenaventura' },
            { id: 'FM-19', nombre: 'San Ignacio' }, { id: 'FM-20', nombre: 'San Juan de Flores' },
            { id: 'FM-21', nombre: 'San Miguelito' }, { id: 'FM-22', nombre: 'Santa Ana' },
            { id: 'FM-23', nombre: 'Santa Lucía' }, { id: 'FM-24', nombre: 'Talanga' },
            { id: 'FM-25', nombre: 'Tatumbla' }, { id: 'FM-26', nombre: 'Valle de Ángeles' },
            { id: 'FM-27', nombre: 'Villa de San Francisco' }, { id: 'FM-28', nombre: 'Vallecillo' },
        ]
    },
    {
        id: 'GR', nombre: 'Gracias a Dios',
        municipios: [
            { id: 'GR-01', nombre: 'Puerto Lempira' }, { id: 'GR-02', nombre: 'Brus Laguna' },
            { id: 'GR-03', nombre: 'Ahuas' }, { id: 'GR-04', nombre: 'Juan Francisco Bulnes' },
            { id: 'GR-05', nombre: 'Villeda Morales' }, { id: 'GR-06', nombre: 'Wampusirpi' },
        ]
    },
    {
        id: 'IN', nombre: 'Intibucá',
        municipios: [
            { id: 'IN-01', nombre: 'La Esperanza' }, { id: 'IN-02', nombre: 'Camasca' },
            { id: 'IN-03', nombre: 'Colomoncagua' }, { id: 'IN-04', nombre: 'Concepción' },
            { id: 'IN-05', nombre: 'Dolores' }, { id: 'IN-06', nombre: 'Intibucá' },
            { id: 'IN-07', nombre: 'Jesús de Otoro' }, { id: 'IN-08', nombre: 'Magdalena' },
            { id: 'IN-09', nombre: 'Masaguara' }, { id: 'IN-10', nombre: 'San Antonio' },
            { id: 'IN-11', nombre: 'San Francisco de Opalaca' }, { id: 'IN-12', nombre: 'San Isidro' },
            { id: 'IN-13', nombre: 'San Juan' }, { id: 'IN-14', nombre: 'San Marcos de la Sierra' },
            { id: 'IN-15', nombre: 'San Miguelito' }, { id: 'IN-16', nombre: 'Santa Lucía' },
            { id: 'IN-17', nombre: 'Yamaranguila' },
        ]
    },
    {
        id: 'IB', nombre: 'Islas de la Bahía',
        municipios: [
            { id: 'IB-01', nombre: 'Roatán' }, { id: 'IB-02', nombre: 'Guanaja' },
            { id: 'IB-03', nombre: 'José Santos Guardiola' }, { id: 'IB-04', nombre: 'Utila' },
        ]
    },
    {
        id: 'LP', nombre: 'La Paz',
        municipios: [
            { id: 'LP-01', nombre: 'La Paz' }, { id: 'LP-02', nombre: 'Aguanqueterique' },
            { id: 'LP-03', nombre: 'Cabañas' }, { id: 'LP-04', nombre: 'Cane' },
            { id: 'LP-05', nombre: 'Chinacla' }, { id: 'LP-06', nombre: 'Guajiquiro' },
            { id: 'LP-07', nombre: 'Lauterique' }, { id: 'LP-08', nombre: 'Marcala' },
            { id: 'LP-09', nombre: 'Mercedes de Oriente' }, { id: 'LP-10', nombre: 'Opatoro' },
            { id: 'LP-11', nombre: 'San Antonio del Norte' }, { id: 'LP-12', nombre: 'San José' },
            { id: 'LP-13', nombre: 'San Juan' }, { id: 'LP-14', nombre: 'San Pedro de Tutule' },
            { id: 'LP-15', nombre: 'Santa Ana' }, { id: 'LP-16', nombre: 'Santa Elena' },
            { id: 'LP-17', nombre: 'Santa María' }, { id: 'LP-18', nombre: 'Santiago de Puringla' },
            { id: 'LP-19', nombre: 'Yarula' },
        ]
    },
    {
        id: 'LE', nombre: 'Lempira',
        municipios: [
            { id: 'LE-01', nombre: 'Gracias' }, { id: 'LE-02', nombre: 'Belén' },
            { id: 'LE-03', nombre: 'Candelaria' }, { id: 'LE-04', nombre: 'Cololaca' },
            { id: 'LE-05', nombre: 'Erandique' }, { id: 'LE-06', nombre: 'Gualcince' },
            { id: 'LE-07', nombre: 'Guarita' }, { id: 'LE-08', nombre: 'La Campa' },
            { id: 'LE-09', nombre: 'La Iguala' }, { id: 'LE-10', nombre: 'Las Flores' },
            { id: 'LE-11', nombre: 'La Unión' }, { id: 'LE-12', nombre: 'La Virtud' },
            { id: 'LE-13', nombre: 'Lepaera' }, { id: 'LE-14', nombre: 'Mapulaca' },
            { id: 'LE-15', nombre: 'Piraera' }, { id: 'LE-16', nombre: 'San Andrés' },
            { id: 'LE-17', nombre: 'San Francisco' }, { id: 'LE-18', nombre: 'San Juan Guarita' },
            { id: 'LE-19', nombre: 'San Manuel Colohete' }, { id: 'LE-20', nombre: 'San Rafael' },
            { id: 'LE-21', nombre: 'San Sebastián' }, { id: 'LE-22', nombre: 'Santa Cruz' },
            { id: 'LE-23', nombre: 'Talgua' }, { id: 'LE-24', nombre: 'Tambla' },
            { id: 'LE-25', nombre: 'Tomalá' }, { id: 'LE-26', nombre: 'Valladolid' },
            { id: 'LE-27', nombre: 'Virginia' }, { id: 'LE-28', nombre: 'San Marcos de Caiquín' },
        ]
    },
    {
        id: 'OC', nombre: 'Ocotepeque',
        municipios: [
            { id: 'OC-01', nombre: 'Ocotepeque' }, { id: 'OC-02', nombre: 'Belén Gualcho' },
            { id: 'OC-03', nombre: 'Concepción' }, { id: 'OC-04', nombre: 'Dolores Merendón' },
            { id: 'OC-05', nombre: 'Fraternidad' }, { id: 'OC-06', nombre: 'La Encarnación' },
            { id: 'OC-07', nombre: 'La Labor' }, { id: 'OC-08', nombre: 'Lucerna' },
            { id: 'OC-09', nombre: 'Mercedes' }, { id: 'OC-10', nombre: 'San Fernando' },
            { id: 'OC-11', nombre: 'San Francisco del Valle' }, { id: 'OC-12', nombre: 'San Jorge' },
            { id: 'OC-13', nombre: 'San Marcos' }, { id: 'OC-14', nombre: 'Santa Fe' },
            { id: 'OC-15', nombre: 'Sensenti' }, { id: 'OC-16', nombre: 'Sinuapa' },
        ]
    },
    {
        id: 'OL', nombre: 'Olancho',
        municipios: [
            { id: 'OL-01', nombre: 'Juticalpa' }, { id: 'OL-02', nombre: 'Campamento' },
            { id: 'OL-03', nombre: 'Catacamas' }, { id: 'OL-04', nombre: 'Concordia' },
            { id: 'OL-05', nombre: 'Dulce Nombre de Culmí' }, { id: 'OL-06', nombre: 'El Rosario' },
            { id: 'OL-07', nombre: 'Esquipulas del Norte' }, { id: 'OL-08', nombre: 'Gualaco' },
            { id: 'OL-09', nombre: 'Guarizama' }, { id: 'OL-10', nombre: 'Guata' },
            { id: 'OL-11', nombre: 'Guayape' }, { id: 'OL-12', nombre: 'Jano' },
            { id: 'OL-13', nombre: 'La Unión' }, { id: 'OL-14', nombre: 'Lepaguare' },
            { id: 'OL-15', nombre: 'Manto' }, { id: 'OL-16', nombre: 'Salama' },
            { id: 'OL-17', nombre: 'San Esteban' }, { id: 'OL-18', nombre: 'San Francisco de Becerra' },
            { id: 'OL-19', nombre: 'San Francisco de La Paz' }, { id: 'OL-20', nombre: 'Santa María del Real' },
            { id: 'OL-21', nombre: 'Silca' }, { id: 'OL-22', nombre: 'Yocón' },
            { id: 'OL-23', nombre: 'Patuca' },
        ]
    },
    {
        id: 'SB', nombre: 'Santa Bárbara',
        municipios: [
            { id: 'SB-01', nombre: 'Santa Bárbara' }, { id: 'SB-02', nombre: 'Arada' },
            { id: 'SB-03', nombre: 'Atima' }, { id: 'SB-04', nombre: 'Azacualpa' },
            { id: 'SB-05', nombre: 'Ceguaca' }, { id: 'SB-06', nombre: 'Concepción del Norte' },
            { id: 'SB-07', nombre: 'Concepción del Sur' }, { id: 'SB-08', nombre: 'Chinda' },
            { id: 'SB-09', nombre: 'El Níspero' }, { id: 'SB-10', nombre: 'Gualala' },
            { id: 'SB-11', nombre: 'Ilama' }, { id: 'SB-12', nombre: 'Macuelizo' },
            { id: 'SB-13', nombre: 'Naranjito' }, { id: 'SB-14', nombre: 'Nuevo Celilac' },
            { id: 'SB-15', nombre: 'Petoa' }, { id: 'SB-16', nombre: 'Protección' },
            { id: 'SB-17', nombre: 'Quimistán' }, { id: 'SB-18', nombre: 'San Francisco de Ojuera' },
            { id: 'SB-19', nombre: 'San José de Colinas' }, { id: 'SB-20', nombre: 'San Luis' },
            { id: 'SB-21', nombre: 'San Marcos' }, { id: 'SB-22', nombre: 'San Nicolás' },
            { id: 'SB-23', nombre: 'San Pedro Zacapa' }, { id: 'SB-24', nombre: 'San Vicente Centenario' },
            { id: 'SB-25', nombre: 'Santa Rita' }, { id: 'SB-26', nombre: 'Trinidad' },
            { id: 'SB-27', nombre: 'Las Vegas' }, { id: 'SB-28', nombre: 'Nueva Frontera' },
        ]
    },
    {
        id: 'VA', nombre: 'Valle',
        municipios: [
            { id: 'VA-01', nombre: 'Nacaome' }, { id: 'VA-02', nombre: 'Alianza' },
            { id: 'VA-03', nombre: 'Amapala' }, { id: 'VA-04', nombre: 'Aramecina' },
            { id: 'VA-05', nombre: 'Caridad' }, { id: 'VA-06', nombre: 'Goascorán' },
            { id: 'VA-07', nombre: 'Langue' }, { id: 'VA-08', nombre: 'San Francisco de Coray' },
            { id: 'VA-09', nombre: 'San Lorenzo' },
        ]
    },
    {
        id: 'YO', nombre: 'Yoro',
        municipios: [
            { id: 'YO-01', nombre: 'Yoro' }, { id: 'YO-02', nombre: 'Arenal' },
            { id: 'YO-03', nombre: 'El Negrito' }, { id: 'YO-04', nombre: 'El Progreso' },
            { id: 'YO-05', nombre: 'Jocon' }, { id: 'YO-06', nombre: 'Morazán' },
            { id: 'YO-07', nombre: 'Olanchito' }, { id: 'YO-08', nombre: 'Santa Rita' },
            { id: 'YO-09', nombre: 'Sulaco' }, { id: 'YO-10', nombre: 'Victoria' },
            { id: 'YO-11', nombre: 'Yorito' },
        ]
    },
];
