use crate::errors::TipError;
use crate::events::TipWithdrawEvent;
use crate::state::Vault;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke_signed, system_instruction::transfer};

pub fn _withdraw_tip(ctx: Context<WithdrawTip>) -> Result<()> {
    require_eq!(
        &ctx.accounts.creator.key(),
        &ctx.accounts.vault.creator.key()
    );

    let vault = &ctx.accounts.vault;

    let rent_lamp = Rent::get()?.minimum_balance(8 + Vault::INIT_SPACE);
    let vault_lamp = &ctx.accounts.vault.get_lamports();
    let withdraw_lamp = vault_lamp - rent_lamp;

    if withdraw_lamp <= 0 {
        return err!(TipError::InsufficientBalance);
    }
    let seeds = &[b"vault", vault.creator.as_ref(), &[vault.bump]];
    let signer = &[&seeds[..]];
    let ix = transfer(&vault.key(), &ctx.accounts.creator.key(), withdraw_lamp);

    invoke_signed(
        &ix,
        &[
            ctx.accounts.vault.to_account_info(),
            ctx.accounts.creator.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        signer,
    )?;
    emit!(TipWithdrawEvent {
        recipient: vault.creator.key(),
        sender: vault.key(),
        amount: withdraw_lamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawTip<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut, seeds = [b"vault", creator.key().as_ref()], bump = vault.bump, has_one = creator)]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}
