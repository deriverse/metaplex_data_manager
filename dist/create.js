import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';
import * as fs from 'fs';
const createToken = async () => {
    try {
        // Загружаем или создаем keypair
        let keypair;
        // Если у вас есть файл с ключами
        if (fs.existsSync('keypair.json')) {
            const secretKey = new Uint8Array(JSON.parse(fs.readFileSync('keypair.json', 'utf8')));
            keypair = Keypair.fromSecretKey(secretKey);
        }
        else {
            // Создаем новый keypair
            keypair = Keypair.generate();
            // Сохраняем ключи для будущего использования
            fs.writeFileSync('keypair.json', JSON.stringify(Array.from(keypair.secretKey)));
        }
        console.log('Публичный ключ:', keypair.publicKey.toString());
        // Подключаемся к devnet для тестирования
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        // Инициализируем Metaplex
        const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(keypair))
            .use(bundlrStorage({
            address: 'https://devnet.bundlr.network',
            providerUrl: clusterApiUrl('devnet'),
            timeout: 60000,
        }));
        console.log('Создаем токен...');
        // Создаем NFT
        const { nft } = await metaplex.nfts().create({
            name: "Wrapped Bitcoin",
            symbol: "WBTC",
            sellerFeeBasisPoints: 500, // 5% роялти
            uri: "https://raw.githubusercontent.com/your-repo/metadata.json", // URL к метаданным
            creators: [
                {
                    address: keypair.publicKey,
                    share: 100,
                }
            ],
            isMutable: true,
            maxSupply: 1, // или null для неограниченного supply
        });
        console.log('Токен создан!');
        console.log('Mint Address:', nft.address.toString());
        console.log('Metadata Address:', nft.metadataAddress.toString());
        console.log('Название:', nft.name);
        console.log('Symbol:', nft.symbol);
        console.log('URI метаданных:', nft.uri);
    }
    catch (error) {
        console.error('Ошибка при создании токена:', error);
        if (error instanceof Error) {
            console.error('Детали ошибки:', error.message);
        }
    }
};
createToken().catch(console.error);
