import { deployContract } from 'ethereum-waffle';
import fs from 'fs';
import { Tester } from './tester';
import { ethers, utils } from 'ethers';
import { expect } from 'chai';
import { Wallet, types, wallet, ETHOperation } from 'zksync';
type TokenLike = types.TokenLike;

function readContractCode(name: string) {
    const fileName = name.split('/').pop();
    return JSON.parse(
        fs.readFileSync(`../../../contracts/artifacts/cache/solpp-generated-contracts/${name}.sol/${fileName}.json`, {
            encoding: 'utf-8'
        })
    );
}
function readFactoryCode() {
    return readContractCode('ZkSyncNFTCustomFactory');
}

declare module './tester' {
    interface Tester {
        testRegisterFactory(wallet: Wallet, feeToken: TokenLike): Promise<void>;
    }
}

Tester.prototype.testRegisterFactory = async function (wallet: Wallet, feeToken: TokenLike) {
    const contract = await deployContract(
        wallet.ethSigner,
        readFactoryCode(),
        [
            'TestFactory',
            'TS',
            wallet.provider.contractAddress.mainContract,
            wallet.provider.contractAddress.govContract
        ],
        {
            gasLimit: 5000000
        }
    );
    const { signature, accountId, accountAddress } = await wallet.signRegisterFactory(contract.address);
    const tx = await contract.registerNFTFactory(accountId, accountAddress, signature.signature, {
        gasLimit: 5000000
    });
    const log = await tx.wait();

    console.log(log);

    // const type = 'MintNFT';
    // const contentHash = utils.randomBytes(32);
    // let { totalFee: fee } = await this.syncProvider.getTransactionFee(type, wallet.address(), feeToken);
    //
    // const handle = await wallet.mintNFT({
    //     recipient: wallet.address(),
    //     contentHash,
    //     feeToken,
    //     fee
    // });
    //
    // const receipt = await handle.awaitVerifyReceipt();
    // expect(receipt.success, `Mint NFT failed with a reason: ${receipt.failReason}`).to.be.true;
    // const state = await wallet.getAccountState();
    // const nft: any = Object.values(state.committed.nfts)[0];
    // const handle_withdraw = await wallet.withdrawNFT({
    //     to: wallet.address(),
    //     token: nft.id,
    //     feeToken,
    //     fee,
    // });
    // const receipt_withdraw = await handle_withdraw.awaitReceipt();
    // expect(receipt_withdraw.success, `Withdraw NFT failed with a reason: ${receipt_withdraw.failReason}`).to.be.true;
    // const owner = await contract.ownerOf(nft.id);
    // expect(owner == wallet.address(), "Contract minting is wrong");
};
