import { describe, expect, it } from 'vitest';
import {
  Molang,
  MolangBinding,
  MolangExpression,
  toMolangSource,
} from '../src/components/ui/molang';

describe('Molang expressions', () => {
  it('builds arithmetic and comparison source', () => {
    expect(Molang.query('get_health').div(20).mul(100).toMolang()).toBe(
      '((query.get_health / 20) * 100)',
    );
    expect(Molang.query('q.get_level').gte(5).toMolang()).toBe(
      '(query.get_level >= 5)',
    );
    expect(Molang.literal(3).neq(4).toMolang()).toBe('(3 != 4)');
  });

  it('combines conditions with and/or/not', () => {
    const a = Molang.query('is_sneaking');
    const b = Molang.query('is_jumping');
    expect(a.and(b).not().toMolang()).toBe(
      '(!(query.is_sneaking && query.is_jumping))',
    );
    expect(a.or(b).toMolang()).toBe('(query.is_sneaking || query.is_jumping)');
  });

  it('renders literals, queries, variables and calls', () => {
    expect(Molang.string("it's").toMolang()).toBe("'it\\'s'");
    expect(Molang.bool(true).toMolang()).toBe('true');
    expect(Molang.variable('#text').toMolang()).toBe('#text');
    expect(Molang.variable('$my_var').toMolang()).toBe('$my_var');
    expect(Molang.context('hud_title_text_string').toMolang()).toBe(
      'context.hud_title_text_string',
    );
    expect(Molang.raw('query.day > 3').toMolang()).toBe('query.day > 3');
    expect(Molang.math('clamp', 1, 0, 10).toMolang()).toBe(
      'math.clamp(1, 0, 10)',
    );
    expect(
      Molang.call('query.is_item_name_any', [
        'main_hand',
        "'apple'",
      ]).toMolang(),
    ).toBe("query.is_item_name_any(main_hand, 'apple')");
  });

  it('builds ternaries and concatenations', () => {
    expect(
      Molang.when(Molang.query('get_health').lt(5), 'Low', 'Ok').toMolang(),
    ).toBe('((query.get_health < 5) ? Low : Ok)');
    expect(Molang.concat(Molang.string('HP: '), 20).toMolang()).toBe(
      "('HP: ' + 20)",
    );
  });

  it('rejects variables without a view/global prefix', () => {
    expect(() => Molang.variable('text')).toThrow(/must start with "#"/);
    expect(MolangExpression.raw('#a').toMolang()).toBe('#a');
  });

  it('rejects non-finite literals', () => {
    expect(() => Molang.literal(Number.NaN)).toThrow(/finite number/);
  });

  it('renders any operand to source', () => {
    expect(toMolangSource(2)).toBe('2');
    expect(toMolangSource(false)).toBe('false');
    expect(toMolangSource(Molang.raw('#x'))).toBe('#x');
    expect(toMolangSource('#raw')).toBe('#raw');
  });
});

describe('Molang bindings', () => {
  it('writes the JSON UI binding shape', () => {
    const binding = Molang.bind.view(Molang.query('get_health'), '#text');
    expect(binding.toJSON()).toEqual({
      binding_type: 'view',
      binding_condition: 'always',
      source_property_name: 'query.get_health',
      target_property_name: '#text',
    });
  });

  it('supports global and collection bindings', () => {
    expect(
      MolangBinding.global('$score', '#text', 'visible').toJSON(),
    ).toMatchObject({
      binding_type: 'global',
      binding_condition: 'visible',
      source_property_name: '$score',
    });
    expect(
      Molang.bind.collection('(#item_name)', '#text', 'shop_items').toJSON(),
    ).toMatchObject({
      binding_type: 'collection',
      binding_collection_name: 'shop_items',
    });
  });

  it('passes unknown fields through and supports names', () => {
    const binding = new MolangBinding({
      source: Molang.variable('#text'),
      target: '#label',
      name: '#hp_label',
      nameOverride: '#hp',
      sourceControl: 'icon',
      binding_type: 'view',
    });
    expect(binding.toJSON()).toEqual({
      binding_type: 'view',
      binding_condition: 'always',
      binding_name: '#hp_label',
      binding_name_override: '#hp',
      source_control_name: 'icon',
      source_property_name: '#text',
      target_property_name: '#label',
    });
  });

  it('describes itself for logs', () => {
    expect(String(Molang.bind.view('#text', '#label'))).toBe('#text -> #label');
  });
});
