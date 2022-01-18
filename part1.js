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

  // Get validators
  console.log("Unique validators: " + countUniqueValidators(blockInfo.rewards));

  // Get transactions
  var transactions = blockInfo.transactions;
  console.log("Total transactions: " + transactions.length);

  // Count unique addresses from all transactions
  var uniqueProgramIds = new Array();
  var uniqueNonProgramIds = new Array();
  var uniqueSigners = new Array();
  var frequency = new Map(); // Map(address -> count)
  var suspiciousAccount;

  transactions.forEach((transaction, i) => {
    var programIds = transactions[i].transaction.message.programIds();
    var nonProgramIds = transactions[i].transaction.message.nonProgramIds();
    // Record uniques program accounts
    programIds.forEach((pubKey, j) => {
      addUnique(uniqueProgramIds, pubKey);
    });
    // Record uniques non-program accounts
    nonProgramIds.forEach((pubKey, j) => {
      if(pubKey.toString() == "5mpjDRgoRYRmSnAXZTfB2bBkbpwvRjobXUjb4WYjF225"){
        suspiciousAccount = pubKey;
      }
      addUnique(uniqueNonProgramIds, pubKey);
    });
    // Record frequency and signers
    const pubKeys = nonProgramIds.concat(programIds);
    pubKeys.forEach((pubKey, j) => {
      if(frequency.get(pubKey.toString()) == undefined){
        frequency.set(pubKey.toString(), 1);
      }else{
        frequency.set(pubKey.toString(), frequency.get(pubKey.toString()) + 1);
      }
      if(transactions[i].transaction.message.isAccountSigner(j)){
        addUnique(uniqueSigners, pubKey);
      }
    });
  });

  console.log("Unique non-program accounts: " + uniqueNonProgramIds.length);
  console.log("Unique program accounts: " + uniqueProgramIds.length);
  console.log("Unique signers: " + uniqueSigners.length);
  console.log("Most frequent address: " + findMostFrequentAddress(frequency));
  await printSuspiciousAccount(suspiciousAccount, connection);
};


function countUniqueValidators(rewards){
  var uniqueValidators = new Array();
  rewards.forEach((reward, i) => {
    if(uniqueValidators.indexOf(reward.pubkey) == -1){
      uniqueValidators.push(reward.pubkey);
    }
  });
  return uniqueValidators.length;
}


function addUnique(array, lookFor){
  var flag = false;
  array.forEach((address, i) => {
    if(array[i].equals(lookFor)){
      flag = true;
    }
  });
  if(!flag){
    array.push(lookFor);
  }
}


function findMostFrequentAddress(frequency){
  var max = 0;
  var mostFreq = new Array();
  frequency.forEach((freq, address) => {
    if(freq >= max){
      if(freq > max){
        mostFreq = new Array();
      }
      max = freq;
      mostFreq.push(address);
    }
  });
  return mostFreq;
}


async function printSuspiciousAccount(suspiciousAccount, connection) {
  var info = await connection.getAccountInfo(suspiciousAccount);
  console.log("Program Account showing up as Non-program account:");
  console.log(info);
}


firstBlock();
