const fs = require("fs");

//remover acentos
function removeAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

//padronizar entrada diferença entre medidas e remoção de palavras especiais
function padronizarInput(text) {
    return removeAcentos(text)
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\b(tipo|extra|premium|especial)\b/gi, "")
        .replace(/\b(\d+)\s*(kg|quilo|g|gramas)\b/gi, "$1kg")
        .replace(/\b(\d+)\s*l\b/gi, "$1l") 
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .sort()
        .join(" ");
}

function categorizacao(products) {
    let categorias = [];

    products.forEach((product) => {
        const tituloPadrao = padronizarInput(product.title);
        
        let buscarCategoria = categorias.find(categoria => categoria.tituloPadrao === tituloPadrao);

        if (buscarCategoria) {
            buscarCategoria.products.push({
                title: product.title,
                supermarket: product.supermarket,
            });
            buscarCategoria.count++;
        } else {
            categorias.push({
                tituloPadrao,
                category: product.title, 
                count: 1,
                products: [{title: product.title, supermarket: product.supermarket}],
            });
        }
    });

    return categorias.map(({ tituloPadrao, ...rest }) => rest);
}

function readJSONFile(filename) {
    try {
        const rawData = fs.readFileSync(filename);
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Erro ao ler o arquivo JSON:", error);
        return [];
    }
}

function saveJSONFile(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`Resultado salvo em: ${filename}`);
    } catch (error) {
        console.error("Erro ao salvar o arquivo JSON:", error);
    }
}

const inputFile = "data01.json";
const outputFile = "resultado.json";

const products = readJSONFile(inputFile);
const categorizedData = categorizacao(products);
saveJSONFile(outputFile, categorizedData);
