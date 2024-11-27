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
  let payer = Keypair.fromSecretKey(secretKey);

// Конфигурация подключения
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const metaplex = Metaplex.make(connection).use(keypairIdentity(payer));

// Функция для обновления метаданных
async function updateMetadata(
  mintAddress: string,
  newUri: string,
  newName: string,
  newSymbol: string
) {
  const mint = new PublicKey(mintAddress);

  try {
    const metadata = await metaplex.nfts().findByMint({mintAddress: mint });

    if (!metadata) {
      throw new Error('Не удалось найти метаданные для указанного токена.');
    }

    const updateResult = await metaplex.nfts().update({
      nftOrSft: metadata,
      name: newName,
      symbol: newSymbol,
      uri: newUri
    });

    console.log('Метаданные обновлены:', updateResult);
  } catch (error) {
    console.error('Ошибка при обновлении метаданных:', error);
  }
}
//
// Параметры для обновления метаданных
const mintAddress = 'A2Pz6rVyXuadFkKnhMXd1w9xgSrZd8m8sEGpuGuyFhaj'; // Адрес существующего mint
const newUri = 'https://demo-static.deriverse.io/usdc.json'; // Новый URI для метаданных
const newName = 'USD Circle Stablecoin';
const newSymbol = 'USDC';


// Запуск обновления метаданных
updateMetadata(mintAddress, newUri, newName, newSymbol).catch(console.error);
