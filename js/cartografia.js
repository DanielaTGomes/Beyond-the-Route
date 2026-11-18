
/* ===================================================
   BEYOND THE ROUTE
   CARTOGRAFIAS HISTORICAS DE LISBOA
   1911 e 1970

   Integracao com QGIS2WEB e Leaflet
   Sistema de referencia: EPSG:3857
=================================================== */

(function () {
    "use strict";

    // 1. DEFINIR OS LIMITES DA EXPORTACAO QGIS

    const limitesQGIS = {
        oeste: -1052861.4136,
        sul: 4670071.6303,
        este: -990708.2269,
        norte: 4700730.5936
    };


    // 2. CONVERTER OS LIMITES PARA LATITUDE/LONGITUDE

    const projecao = L.CRS.EPSG3857;

    const sudoeste = projecao.unproject(
        L.point(
            limitesQGIS.oeste,
            limitesQGIS.sul
        )
    );

    const nordeste = projecao.unproject(
        L.point(
            limitesQGIS.este,
            limitesQGIS.norte
        )
    );

    const limitesCartografia = L.latLngBounds(
        sudoeste,
        nordeste
    );


    // 3. ORGANIZAR A ORDEM DAS CAMADAS

    // Mapa ESRI no fundo
    const paneESRI = map.getPane(
        "pane_ESRIGraylight_0"
    );

    if (paneESRI) {
        paneESRI.style.zIndex = 200;
    }

    // Criar painel da cartografia historica
    if (!map.getPane("pane_historico")) {
        map.createPane("pane_historico");
    }

    const paneHistorico = map.getPane(
        "pane_historico"
    );

    paneHistorico.style.zIndex = 300;
    paneHistorico.style.pointerEvents = "none";

    // Disfarcar as margens brancas
    paneHistorico.style.mixBlendMode = "multiply";


    // 4. CARTOGRAFIA DE 1911

    const cartografia1911 = L.imageOverlay(
        "images/cartografia_1911.png",
        limitesCartografia,
        {
            pane: "pane_historico",
            opacity: 1.0,
            interactive: false,
            alt: "Cartografia de Lisboa em 1911"
        }
    );


    // 5. CARTOGRAFIA DE 1970

    const cartografia1970 = L.imageOverlay(
        "images/cartografia_1970.png",
        limitesCartografia,
        {
            pane: "pane_historico",
            opacity: 1.0,
            interactive: false,
            alt: "Cartografia de Lisboa em 1970"
        }
    );


    // 6. DIAGNOSTICO DE CARREGAMENTO

    cartografia1911.on("load", function () {
        console.log("Mapa de 1911 carregado.");
    });

    cartografia1970.on("load", function () {
        console.log("Mapa de 1970 carregado.");
    });

    cartografia1911.on("error", function () {
        console.error("Erro: cartografia_1911.png");
    });

    cartografia1970.on("error", function () {
        console.error("Erro: cartografia_1970.png");
    });


    // 7. CONTROLO DE CARTOGRAFIAS

    const controloHistorico = L.control.layers(
        {
            "1910 - Cartografia de 1911": cartografia1911,
            "1974 - Cartografia de 1970": cartografia1970
        },
        null,
        {
            position: "topright",
            collapsed: false
        }
    );

    controloHistorico.addTo(map);


    // 8. FUNCAO PARA ALTERNAR ENTRE EPOCAS

    window.mostrarCartografia = function (ano) {

        map.removeLayer(cartografia1911);
        map.removeLayer(cartografia1970);

        if (String(ano) === "1910") {
            cartografia1911.addTo(map);
        }

        if (String(ano) === "1974") {
            cartografia1970.addTo(map);
        }
    };


    // 9. INICIAR COM CARTOGRAFIA DE 1970

    mostrarCartografia("1974");


    // 10. CONFIRMAR COORDENADAS

    console.log(
        "Limites cartograficos:",
        limitesCartografia
    );

    console.log(
        "Beyond the Route: cartografias configuradas."
    );


/* ====================================================
   BEYOND THE ROUTE
   ALTERNANCIA AUTOMATICA DAS CAMADAS POR REVOLUCAO
==================================================== */


// 1. CAMADAS VETORIAIS DE 1910

const camadas1910 = [
    layer_Lugares1910_5,
    layer_Percursos1910_6,
    layer_Interaes1910_7,
    layer_Marcos1910_8
];


// 2. CAMADAS VETORIAIS DE 1974

const camadas1974 = [
    layer_Lugares1974_1,
    layer_Percursos1974_2,
    layer_Interaes1974_3,
    layer_Marcos1974_4
];


// 3. FUNCAO PARA MOSTRAR APENAS O ANO SELECIONADO

function ativarCamadasDoAno(ano) {

    const anoSelecionado = String(ano);

    if (
        anoSelecionado !== "1910" &&
        anoSelecionado !== "1974"
    ) {
        console.warn("Ano nao reconhecido:", ano);
        return;
    }

    // Remover as camadas das duas revolucoes
    // antes de ativar as correspondentes

    [...camadas1910, ...camadas1974].forEach(
        function (camada) {

            if (map.hasLayer(camada)) {
                map.removeLayer(camada);
            }

        }
    );

    // Selecionar o grupo correspondente

    const grupoAtivo =
        anoSelecionado === "1910"
            ? camadas1910
            : camadas1974;

    // Ativar as quatro camadas da revolucao

    grupoAtivo.forEach(function (camada) {

        if (!map.hasLayer(camada)) {
            map.addLayer(camada);
        }

    });

    console.log(
        "Camadas da revolucao de " +
        anoSelecionado +
        " ativadas."
    );
}


// 4. ASSOCIAR A MUDANCA DE CARTOGRAFIA
// A MUDANCA DAS CAMADAS VETORIAIS

map.on("baselayerchange", function (evento) {

    if (evento.layer === cartografia1911) {

        ativarCamadasDoAno("1910");

    } else if (evento.layer === cartografia1970) {

        ativarCamadasDoAno("1974");

    }

});


// 5. ATUALIZAR A FUNCAO MOSTRARCARTOGRAFIA
// Para funcionar tambem com botoes personalizados

const mostrarCartografiaAnterior =
    window.mostrarCartografia;

window.mostrarCartografia = function (ano) {

    if (
        typeof mostrarCartografiaAnterior === "function"
    ) {
        mostrarCartografiaAnterior(ano);
    }

    ativarCamadasDoAno(ano);

};


// 6. CONFIGURACAO INICIAL
// Iniciar apenas com as camadas de 1974

ativarCamadasDoAno("1974");

console.log(
    "Beyond the Route: alternancia cronologica configurada."
);


})();
