import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Функция для проверки существования mint аккаунта
async function checkMintAccount(connection: Connection, mintAddress: string) {
    try {
        const mintPublicKey = new PublicKey(mintAddress);
        const mintAccount = await connection.getAccountInfo(mintPublicKey);
        
        if (!mintAccount) {
            throw new Error('Mint аккаунт не найден');
        }
        
        console.log('Mint аккаунт найден:', {
            address: mintAddress,
            owner: mintAccount.owner.toString(),
            dataSize: mintAccount.data.length,
        });
        
        return true;
    } catch (error) {
        console.error('Ошибка при проверке mint аккаунта:', error);
        return false;
    }
}

// Функция для создания метаданных
async function createMetadataForExistingToken(
    mintAddress: string,
    newUri: string,
    newName: string,
    newSymbol: string,
    metaplex: Metaplex
) {
    try {
        console.log('Начало создания метаданных для токена...');
        const mint = new PublicKey(mintAddress);

        // Проверяем существование mint аккаунта
        const mintExists = await checkMintAccount(metaplex.connection, mintAddress);
        if (!mintExists) {
            throw new Error('Невозможно продолжить без действительного mint аккаунта');
        }

        console.log(`Создаю метаданные для токена с mint адресом: ${mintAddress}`);

        // Получаем текущие метаданные, если они есть
        console.log('Проверка существующих метаданных...');
        const metadata = await metaplex.nfts().findByMint({ mintAddress: mint }).catch(() => null);
        
        if (metadata) {
            console.log('Найдены существующие метаданные, обновляем...');
            const updateResult = await metaplex.nfts().update({
                nftOrSft: metadata,
                name: newName,
                symbol: newSymbol,
                uri: newUri,
                sellerFeeBasisPoints: 0,
            });
            console.log('Метаданные успешно обновлены:', updateResult);
            return;
        }

        console.log('Существующие метаданные не найдены, создаем новые...');
        // Если метаданных нет, создаем новые
        const output = await metaplex.nfts().createSft({
            uri: newUri,
            name: newName,
            symbol: newSymbol,
            sellerFeeBasisPoints: 0,
            isMutable: true,
            useExistingMint: mint,
            tokenStandard: TokenStandard.Fungible,
            creators: [{
                address: metaplex.identity().publicKey,
                share: 100,
            }],
        });
        
        console.log('Метаданные успешно созданы для токена:', {
            mint: output.mintAddress.toString(),
            metadataAddress: output.metadataAddress.toString(),
            name: output.sft.name,
            symbol: output.sft.symbol,
            uri: output.sft.uri
        });
    } catch (error) {
        console.error('Ошибка при создании метаданных:', error);
        if (error instanceof Error) {
            console.error('Детали ошибки:', error.message);
            console.error('Стек вызовов:', error.stack);
        }
        throw error;
    }
}

async function main() {
    try {
        console.log('Начало выполнения программы...');
        
        // Загрузка ключа
        console.log('Загрузка ключа...');
        const keyPath = join(__dirname, 'auth_keypair.json');
        console.log('Путь к файлу ключа:', keyPath);
        
        const secretKey = new Uint8Array(JSON.parse(readFileSync(keyPath, 'utf8')));
        const payer = Keypair.fromSecretKey(secretKey);
        console.log('Публичный ключ:', payer.publicKey.toString());

        // Подключение
        console.log('Подключение к Solana...');
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        
        // Проверка баланса
        const balance = await connection.getBalance(payer.publicKey);
        console.log('Баланс аккаунта:', balance / 1e9, 'SOL');

        // Инициализация Metaplex
        console.log('Инициализация Metaplex...');
        const metaplex = Metaplex.make(connection).use(keypairIdentity(payer));

        // Параметры для создания метаданных
        const mintAddress = 'A2Pz6rVyXuadFkKnhMXd1w9xgSrZd8m8sEGpuGuyFhaj';
        const newUri = 'https://demo-static.deriverse.io/usdc.json';
        const newName = 'USD Circle Stablecoin';
        const newSymbol = 'USDC';

        // Создание метаданных
        console.log('Начало создания метаданных...');
        await createMetadataForExistingToken(mintAddress, newUri, newName, newSymbol, metaplex);
        
        console.log('Программа успешно завершена');
    } catch (error) {
        console.error('Ошибка в main():', error);
        if (error instanceof Error) {
            console.error('Стек ошибки:', error.stack);
        }
        process.exit(1);
    }
}

// Запускаем main
main().catch((error) => {
    console.error('Необработанная ошибка:', error);
    process.exit(1);
});