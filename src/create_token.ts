import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import * as fs from 'fs';

// Загрузка приватного ключа из файла auth_keypair.json
function loadKeypair(filePath: string): Keypair {
    try {
        const keyData = fs.readFileSync(filePath, 'utf-8');
        const secretKey = new Uint8Array(JSON.parse(keyData));
        return Keypair.fromSecretKey(secretKey);
    } catch (error) {
        throw new Error(`Не удалось загрузить ключ из файла ${filePath}`);
    }
}

// Укажите путь к вашему файлу с ключом
const secretKey = new Uint8Array(JSON.parse(fs.readFileSync('src/auth_keypair.json', 'utf8')));
const payer = Keypair.fromSecretKey(secretKey);

// Конфигурация подключения
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const metaplex = Metaplex.make(connection).use(keypairIdentity(payer));

// Функция для создания нового токена
async function createToken(newUri: string, newName: string, newSymbol: string) {
    try {
        // Создаем новый Keypair для токена (Mint)
        const mint = Keypair.generate();

        console.log(`Создаем токен с mint: ${mint.publicKey.toString()}`);

        // Создаем токен с метаданными
        const { nft } = await metaplex.nfts().create({
            uri: newUri,
            name: newName,
            symbol: newSymbol,
            sellerFeeBasisPoints: 500, // Комиссия создателя (в сотых процента)
            isMutable: true, // Позволяет менять метаданные в будущем
            mintAuthority: payer, // Кто имеет права на управление токеном
            updateAuthority: payer, // Кто может обновлять метаданные
            useNewMint: mint, // Новый mint
        });

        console.log('Токен успешно создан:', nft);
        console.log(`Адрес токена (mint): ${mint.publicKey.toString()}`);
    } catch (error) {
        console.error('Ошибка при создании токена:', error);
    }
}

// Параметры для нового токена
const newUri = 'https://demo-static.deriverse.io/weth.json';
const newName = 'Wrapped Ether (Wormhole)';
const newSymbol = 'WETH';

// Запуск создания токена
createToken(newUri, newName, newSymbol).catch(console.error);
