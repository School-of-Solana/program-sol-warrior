#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

mod errors;
mod events;
mod instructions;
mod state;
use instructions::*;
declare_id!("uQFxxGURSSagfwpeEx8DQT1yLbLiqfuMAqLsjWYKbJA");

#[program]
pub mod anchor_project {
    use super::*;

    pub fn init_vault(ctx: Context<InitVault>) -> Result<()> {
        _init_vault(ctx)
    }

    pub fn deposit_tip(ctx: Context<DepositTip>, amount: u64) -> Result<()> {
        _deposit_tip(ctx, amount)
    }

    pub fn withdraw_tip(ctx: Context<WithdrawTip>) -> Result<()> {
        _withdraw_tip(ctx)
    }
}
