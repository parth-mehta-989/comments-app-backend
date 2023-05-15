const { client} = require('../db/db')

exports.getAllParentCommentsHandler = async (req, res) => {
    try {
        console.log("got request to get all parent comments with corresponding children")
        let result = await client.query(
            `SELECT c1.id, c1.data, c1.username, c1.created, c1.updated,
                CASE WHEN COUNT(c2.id) > 0 
                THEN json_agg(c2.* order by c2.id ASC) 
                ELSE NULL 
                END AS children
            FROM comments c1
            LEFT JOIN comments c2 ON c1.id = c2.parent_id 
            WHERE c1.parent_id IS NULL
            GROUP BY c1.id
            ORDER BY c1.id DESC;
            `)
        console.log("got all parent comments successfully")
        res.send(result.rows)
    } catch (err) {
        console.log("error while getting all parent comments with their children\n", err)
        res.sendStatus(500).send(err)
    }
    
};

exports.createCommentHandler = async (req, res) => {
    
    let commentData = req.body.data;
    let userName = req.body.username;
    let parentId = req.body.parent_id;
     

    if (parentId) {
        try {
            const parentResult = await client.query(`SELECT * FROM comments WHERE id = $1`, [parentId]);
            if (parentResult.rowCount != 1) {
                console.log(`no comment found with id ${parentId}, can't create child comment for this id` )
                return res.sendStatus(400);
            }
        } catch (err) {
            console.log(`error checking comment with id: ${parentId}, skipping creating of child comment` )
            console.log(err);
            return res.status(500).send({err});
        }
    }

    try {
        let now = new Date()
        const result = await client.query(`
            INSERT INTO comments (data, username, parent_id, created)
            VALUES ($1, $2, $3, $4)
            RETURNING id, data, parent_id, username, created`,
            [commentData, userName, parentId, now]);
            console.log("successfully created comment")
            res.send(result.rows[0]);
    } catch (err) {
            console.log(`error creating comment` )
            console.log(err);
            res.status(500).send({err});
    }
};

exports.deleteCommentHandler = async (req, res) => {
    let id = parseInt(req.params.id)
    console.log("got request to delete comment")
    try {
        let childrenResult = await client.query(`SELECT * FROM comments WHERE parent_id = $1`, [id])
        if (childrenResult.rowCount) {
            console.log(`found child comments for parent ${id}`)
            let deletedChildrenResponse = await deleteChildren(id);
            console.log(deletedChildrenResponse.rowCount)
            console.log("successfully deleted children for comment", id)
        }
    } catch (err) {
        console.log("error deleting/checking children for comment", id)
        res.status(500).send(err)
    }
    try {
        const result = await client.query(`
            DELETE FROM comments
            WHERE id = $1
        `, [id]);
        console.log(`successfully deleted comment ${id}`)
        res.status(200).send({ deletedRows:result.rowCount })
        return
    } catch (err) {
        consolg.log(`error deleting comment ${id}`)
        console.log(err)
        return res.status(500).send({err});
    }
};

exports.updateCommentHandler = async (req, res) => {
    let id = parseInt(req.params.id)
    let commentData = req.body.data
    let now = new Date()
    try {
        const updateResult = await client.query(
            `UPDATE comments 
            SET data = $1, updated = $2
            WHERE id = $3;`,
            [commentData, now, id]
        )
        if (updateResult.rowCount) {
            console.log(`updated comment ${id}`)
            res.send(updateResult.rows[0])
        } else {
            console.log(`no comment found for ${id}, skipping update...`)
            res.sendStatus(400)
        }
        
    } catch (err) {
        console.log(`error updating comment ${id}`)
        console.log(err)
        return res.status(500).send({err});
    }
};

/* Helpers */
let deleteChildren = async function (id) {
    const result = await client.query(`
        DELETE FROM comments
        WHERE parent_id = $1
        `, [id]);
    return result.rows
}
