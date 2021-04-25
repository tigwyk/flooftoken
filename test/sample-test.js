// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Token contract", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let Token;
  let hardhatToken;
  let minter;
  let addr1;
  let addr2;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("FloofToken");
    
    [minter, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    hardhatToken = await Token.deploy(1000000);
    //console.log(await hardhatToken);
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right minter", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects our owner to be a minter
      expect(await hardhatToken.hasRole(hardhatToken.DEFAULT_ADMIN_ROLE(),minter.address)).to.equal(true);
    });

    it("Should assign the total supply of tokens to the minter", async function () {
      const minterBalance = await hardhatToken.balanceOf(minter.address);
      expect(await hardhatToken.totalSupply()).to.equal(minterBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from minter to addr1
      await hardhatToken.transfer(addr1.address, 50);
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await hardhatToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialMinterBalance = await hardhatToken.balanceOf(minter.address);

      // Try to send 1 token from addr1 (0 tokens) to minter (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).transfer(minter.address, 1)
      ).to.be.revertedWith("transfer amount exceeds balance");

      // minter balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(minter.address)).to.equal(
        initialMinterBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialMinterBalance = await hardhatToken.balanceOf(minter.address);

      // Transfer 100 tokens from minter to addr1.
      await hardhatToken.transfer(addr1.address, 100);

      // Transfer another 50 tokens from minter to addr2.
      await hardhatToken.transfer(addr2.address, 50);

      // Check balances.
      const finalMinterBalance = await hardhatToken.balanceOf(minter.address);
      expect(finalMinterBalance).to.equal(initialMinterBalance - 150);

      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});