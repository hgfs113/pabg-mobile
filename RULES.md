Пример красивой архитектуры


apps/
    web/

packages/

    knowledge-engine/
        progression/
        quests/
        economy/
        world/
        events/

    ai-gamemaster/

    content/

        ml-campaign/

        algorithms-campaign/

        kubernetes-campaign/

        math-campaign/

    ui/

Перед написанием любого нового модуля он обязан сначала создать README.md рядом с ним, где кратко описывает:

- зачем существует модуль;
- какие сущности в нём живут;
- какие инварианты он гарантирует;
- от каких модулей зависит;
- кто имеет право его использовать.