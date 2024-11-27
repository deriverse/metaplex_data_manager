import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

const getNFTMetadata = async () => {
    try {
        console.log('Подключение к Solana...');
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        
        const metaplex = new Metaplex(connection);
        
        // Пример адреса NFT
        const mintAddress = new PublicKey("E6DQWGA7U72oeJAQjfbW9RgWAfAnDX6WnBvzDMvjZnzR");
        
        console.log('Получение метаданных...');
        const nft = await metaplex.nfts().findByMint({ mintAddress });
        
        console.log('Результат:', {
            name: nft.name,
            symbol: nft.symbol,
            uri: nft.uri,
            sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
            collection: nft.collection,
        });

    } catch (error) {
        console.error('Произошла ошибка:', error);
    }
};

getNFTMetadata().catch(console.error);