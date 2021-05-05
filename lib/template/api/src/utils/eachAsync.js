const eachAsync = async (collection, iterator) => {
    const iter = [];
    for (let i = 0; i < collection.length; ++i) {
        iter.push((async () => {

            await iterator(collection[i], i);
        })());
    }

    await Promise.all(iter);
};

module.exports = eachAsync;