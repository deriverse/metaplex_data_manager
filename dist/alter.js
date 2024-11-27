import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { readFileSync } from 'fs';
const updateSPLMetadata = async () => {
    try {
        // Загружаем ваш секретный ключ
        const secretKey = JSON.parse(readFileSync('auth_keypair.json', 'utf8'));
        const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
        console.log('Подключение к Solana...');
        const connection = new Connection('https://api.devnet.solana.com');
        // Инициализируем Metaplex с вашим keypair
        const metaplex = new Metaplex(connection).use(keypairIdentity(keypair));
        // Адрес SPL токена
        const mintAddress = new PublicKey("E6DQWGA7U72oeJAQjfbW9RgWAfAnDX6WnBvzDMvjZnzR");
        // Получаем текущие метаданные токена
        const token = await metaplex.tokens().findByMint({ mintAddress });
        console.log('Текущие метаданные:', {
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
        });
        // Обновляем метаданные SPL токена
        const { response } = await metaplex.tokens().update({
            mintAddress: mintAddress,
            name: "Wrapped Ether (Wormhole)",
            description: "Wrapped Ether (Wormhole)",
            symbol: "WETH",
        });
        console.log('Метаданные SPL токена успешно обновлены!');
        console.log('Signature:', response.signature);
    }
    catch (error) {
        console.error('Произошла ошибка при обновлении метаданных:', error);
    }
};
updateSPLMetadata().catch(console.error);
