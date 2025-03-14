export default function() {
	const partials = [
		"systems/shadowdark/templates/actors/npc/abilities.hbs",
		"systems/shadowdark/templates/actors/npc/abilities/attacks.hbs",
		"systems/shadowdark/templates/actors/npc/abilities/special.hbs",
		"systems/shadowdark/templates/actors/npc/description.hbs",
		"systems/shadowdark/templates/actors/npc/partials/ability-scores.hbs",
		"systems/shadowdark/templates/actors/npc/partials/ac.hbs",
		"systems/shadowdark/templates/actors/npc/partials/hp.hbs",
		"systems/shadowdark/templates/actors/player/abilities.hbs",
		"systems/shadowdark/templates/actors/player/abilities/ac.hbs",
		"systems/shadowdark/templates/actors/player/abilities/attacks.hbs",
		"systems/shadowdark/templates/actors/player/abilities/hp.hbs",
		"systems/shadowdark/templates/actors/player/abilities/luck.hbs",
		"systems/shadowdark/templates/actors/player/abilities/initiative.hbs",
		"systems/shadowdark/templates/actors/player/background.hbs",
		"systems/shadowdark/templates/actors/player/inventory.hbs",
		"systems/shadowdark/templates/actors/player/inventory/coins.hbs",
		"systems/shadowdark/templates/actors/player/inventory/slots.hbs",
		"systems/shadowdark/templates/actors/player/spells.hbs",
		"systems/shadowdark/templates/actors/player/talents.hbs",
		"systems/shadowdark/templates/actors/partials/effects.hbs",
		"systems/shadowdark/templates/items/partials/active-effects.hbs",
		"systems/shadowdark/templates/items/partials/armor.hbs",
		"systems/shadowdark/templates/items/partials/cost.hbs",
		"systems/shadowdark/templates/items/partials/duration.hbs",
		"systems/shadowdark/templates/items/partials/effect.hbs",
		"systems/shadowdark/templates/items/partials/effect-toggle-items.hbs",
		"systems/shadowdark/templates/items/partials/item-category.hbs",
		"systems/shadowdark/templates/items/partials/light-source.hbs",
		"systems/shadowdark/templates/items/partials/npc-attack.hbs",
		"systems/shadowdark/templates/items/partials/slots.hbs",
		"systems/shadowdark/templates/items/partials/spell.hbs",
		"systems/shadowdark/templates/items/partials/talent.hbs",
		"systems/shadowdark/templates/items/partials/treasure.hbs",
		"systems/shadowdark/templates/items/partials/weapon.hbs",
		"systems/shadowdark/templates/items/tabs/description.hbs",
		"systems/shadowdark/templates/items/tabs/details.hbs",
		"systems/shadowdark/templates/items/tabs/effects.hbs",
		"systems/shadowdark/templates/items/tabs/light.hbs",
		"systems/shadowdark/templates/partials/details/armor.hbs",
		"systems/shadowdark/templates/partials/details/default.hbs",
		"systems/shadowdark/templates/partials/details/spell.hbs",
		"systems/shadowdark/templates/partials/details/weapon.hbs",
		"systems/shadowdark/templates/partials/weapon-attack.hbs",
	];

	const paths = {};
	for (const path of partials) {
		const [key] = path.split("/").slice(3).join("/").split(".");
		paths[key] = path;
	}

	return loadTemplates(paths);
}
