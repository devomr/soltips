use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Username already exists")]
    UsernameAlreadyExists,

    #[msg("The provided amount must be greater than zero")]
    InvalidAmount,

    #[msg("Signer does not have access to call this instruction.")]
    InvalidSigner,
}
