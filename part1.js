
/*
{
  err: null,
  fee: 5000,
  innerInstructions: [],
  logMessages: [
    'Program 11111111111111111111111111111111 invoke [1]',
    'Program 11111111111111111111111111111111 success'
  ],
  postBalances: [ 19794357823, 1000000000, 1 ],
  postTokenBalances: [],
  preBalances: [ 20794362823, 0, 1 ],
  preTokenBalances: [],
  rewards: [],
  status: { Ok: null }
}
{
  message: Message {
    header: {
      numReadonlySignedAccounts: 0,
      numReadonlyUnsignedAccounts: 1,
      numRequiredSignatures: 1
    },
    accountKeys: [
    PublicKey {
      _bn: <BN: e0eaef4c5128893c5d1fed905a2e7220580af5e5d78318f5c788ceb13d488a08>
    },
    PublicKey {
      _bn: <BN: 1e298785b3ae825e425fd2c34a2ad771a4908181f7b26d98204f1d3e15961e81>
    },
    PublicKey { _bn: <BN: 0> }
   ],
    recentBlockhash: 'J7FkYF2z2pYwaN9qWCJdv4CpYANJ1PUG9kLJCbMFeG1S',
    instructions: [ [Object] ],
    indexToProgramIds: Map(1) { 2 => [PublicKey] }
  },
  signatures: [
    '4jnMXfZjZHtukumouLhAsxG1ab5mfuY8MUsucdC8W6RZm8wQJnPM9Z8L5tpvcckCbUdRdEHspeKeTXcJkoeRKsM5'
  ]
}
*/
const web3 =  require("@solana/web3.js");


const firstBlock = async () => {
  // Connect to cluster
  var connection = new web3.Connection(
    web3.clusterApiUrl('mainnet-beta'),
    'confirmed',
  );

  // Get block info
  // block height = 89923086
  var blockInfo = await connection.getBlock(100356971);
  //console.log(blockInfo);


  // GET VALIDATORS
  /*var rewards = blockInfo.rewards;
  var uniqueValidators = new Array();
  rewards.forEach((reward, i) => {
    if(uniqueValidators.indexOf(reward.pubkey) == -1){
      uniqueValidators.push(reward.pubkey);
    }
  });
  console.log(uniqueValidators.length);*/

  // Transactions
  var transactions = blockInfo.transactions;
  console.log(transactions[0].transaction.message.programIds());
  var uniqueProgramIds = new Array();
  var uniqueNonProgramIds = new Array();
  var uniqueSigners = new Array();
  var frequency = new Map();
  var signers = 0;

  transactions.forEach((transaction, i) => {
    var programIds = transactions[i].transaction.message.programIds();
    var nonProgramIds = transactions[i].transaction.message.nonProgramIds();
    // Record uniques program accounts
    programIds.forEach((address, j) => {
      address = address.toString();
      if(uniqueProgramIds.indexOf(address) == -1){
        uniqueProgramIds.push(address);
      }
    });
    // Record uniques non-program accounts
    nonProgramIds.forEach((address, j) => {
      address = address.toString();
      if(uniqueNonProgramIds.indexOf(address) == -1){
        uniqueNonProgramIds.push(address);
      }
    });
    // Record frequency and signers
    const addresses = nonProgramIds.concat(programIds);
    addresses.forEach((address, j) => {
      if(frequency.get(address) == undefined){
        frequency.set(address, 1);
      }else{
        frequency.set(address, frequency.get(address) + 1);
      }
      if(transactions[i].transaction.message.isAccountSigner(j)){
        signers+=1;
      }
      if(transactions[i].transaction.message.isAccountSigner(j) && uniqueSigners.indexOf(address) == -1){
        uniqueSigners.push(address);
      }
    });

  });

  console.log("Unique non-program accounts: " + uniqueNonProgramIds.length);
  console.log("Unique program accounts: " + uniqueProgramIds.length);
  console.log("Unique signers: " + uniqueSigners.length);
  console.log("Total signatures: " + signers);


  /*console.log(message.programIds());
  console.log(message.nonProgramIds());*/
  // get account info
  // account data is bytecode that needs to be deserialized
  // serialization and deserialization is program specic
  //let account = await connection.getAccountInfo(wallet.publicKey);
  //console.log(account);
};

function saveIfUnique(addresses, uniqueAddresses, uniqueSigners){
  var index = 0;
  addresses.forEach((address, i) => {
    if(uniqueAddresses.indexOf(address) == -1){
      uniqueAddresses.push(address);
    }
    if(message.isAccountSigner(index) && uniqueSigners.indexOf(address) == -1){
      uniqueSigners.push(address);
    }
    index = i;
  });
  return (uniqueAddresses, uniqueSigners, index);
}

firstBlock();
