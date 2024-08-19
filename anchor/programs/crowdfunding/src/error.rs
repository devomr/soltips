use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Username already exists")]
    UsernameAlreadyExists,

    #[msg("Transfer amount is invalid")]
    InvalidTransferAmount,
}
