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
  var rewards = blockInfo.rewards;
  var uniqueValidators = new Array();
  rewards.forEach((reward, i) => {
    if(uniqueValidators.indexOf(reward.pubkey) == -1){
      uniqueValidators.push(reward.pubkey);
    }
  });
  console.log("Unique validators: " +uniqueValidators.length);

  // Transactions
  var transactions = blockInfo.transactions;
  var uniqueProgramIds = new Array();
  var uniqueNonProgramIds = new Array();
  var uniqueSigners = new Array();
  var frequency = new Map();

  transactions.forEach((transaction, i) => {
    var programIds = transactions[i].transaction.message.programIds();
    var nonProgramIds = transactions[i].transaction.message.nonProgramIds();
    // Record uniques program accounts
    programIds.forEach((address, j) => {
      //address = address.toString();
      addUnique(uniqueProgramIds, address);
    });
    // Record uniques non-program accounts
    nonProgramIds.forEach((address, j) => {
      addUnique(uniqueNonProgramIds, address);
    });
    // Record frequency and signers
    const addresses = nonProgramIds.concat(programIds);
    addresses.forEach((address, j) => {
      if(frequency.get(address.toString()) == undefined){
        frequency.set(address.toString(), 1);
      }else{
        frequency.set(address.toString(), frequency.get(address.toString()) + 1);
      }
      if(transactions[i].transaction.message.isAccountSigner(j)){
        addUnique(uniqueSigners, address);
      }
    });
  });

  console.log("Unique non-program accounts: " + uniqueNonProgramIds.length);
  console.log("Unique program accounts: " + uniqueProgramIds.length);
  console.log("Unique signers: " + uniqueSigners.length);
  console.log("Total transactions: " + transactions.length);


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

  console.log("Most frequent address: " + mostFreq);

};

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

firstBlock();
