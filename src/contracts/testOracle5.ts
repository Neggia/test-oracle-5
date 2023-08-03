import {
    assert,
    MethodCallOptions,
    ContractTransaction,
    ByteString,
    hash256,
    method,
    prop,
    PubKey,
    Sig,
    SmartContract,
    Utils,
    bsv,
    hash160,
} from 'scrypt-ts'

import { RabinSig, RabinPubKey, RabinVerifierWOC, RabinVerifier } from 'scrypt-ts-lib'

export class TestOracle5 extends SmartContract {
    @prop()
    userPK: PubKey

    @prop()
    amount: bigint

    // Oracles Rabin public key.
    @prop()
    oraclePubKey: RabinPubKey

    constructor(userPK: PubKey, amount: bigint, nRabin: bigint) {
        super(...arguments)
        this.userPK = userPK
        this.amount = amount
        // Error: Execution failed, Oracle sig verify failed.
        //this.oraclePubKey = 123n;
        // Error: the raw script cannot match the ASM template of contract Test
        this.oraclePubKey = 1829242205158919081612948116945621074359902846590230415405905851847151653111362805089526991918515717929789289269295691772564212986498178144673616832580110190112293523954713829321239941209031548855941608655453227624899470714988234371988383378492413525943871558048853228687026003751784842839597402013721n;
    }

    @method()
    public lockStep1(
        userSig: Sig, 
        dataMessage: ByteString,
        dataSig: RabinSig,
    ) {
        assert(this.checkSig(userSig, this.userPK), 'User signature check failed')

        assert(
            RabinVerifier.verifySig(dataMessage, dataSig, this.oraclePubKey),
            'Oracle sig verify failed.'
        )
    }
}