use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Username already exists")]
    UsernameAlreadyExists,

    #[msg("The provided amount must be greater than zero")]
    InvalidAmount,

    #[msg("You do not have enough funds to withdraw the requested amount")]
    InsufficientFunds,

    #[msg("Withdrawal would reduce the account balance below the rent-exempt minimum.")]
    InsufficientFundsAfterWithdraw,

    #[msg("Signer does not have access to call this instruction.")]
    InvalidSigner,
}
